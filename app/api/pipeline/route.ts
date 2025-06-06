import {
  createClient,
  type PostgrestSingleResponse,
  type PostgrestResponse,
} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Database types
export interface FoodTruck {
  id: string;
  name: string;
  description?: string;
  current_location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  scheduled_locations: Array<{
    lat: number;
    lng: number;
    start_time: string;
    end_time: string;
  }>;
  operating_hours: OperatingHours;
  menu: Array<{
    category: string;
    items: Array<{
      name: string;
      description?: string;
      price: number;
      dietary_tags: string[];
    }>;
  }>;
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social_media: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  data_quality_score: number;
  verification_status: 'pending' | 'verified' | 'flagged';
  source_urls: string[];
  cuisine_type?: string[]; // Added
  price_range?: string; // Added
  created_at: string;
  updated_at: string;
  last_scraped_at?: string;
}

export interface ScrapingJob {
  id: string;
  job_type: string;
  target_url?: string;
  target_handle?: string;
  platform?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  data_collected?: Record<string, unknown>;
  errors?: string[];
  retry_count: number;
  max_retries: number;
  created_at: string;
}

export interface DataProcessingQueue {
  id: string;
  truck_id: string;
  processing_type: string;
  raw_data: Record<string, unknown>;
  processed_data?: Record<string, unknown>;
  gemini_tokens_used: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  created_at: string;
  processed_at?: string;
}

interface PipelineRequestBody {
  target_url: string;
  job_type?: string;
  priority?: number;
}

// Food truck operations
export const FoodTruckService = {
  async getAllTrucks(
    limit = 50,
    offset = 0,
  ): Promise<{ trucks: FoodTruck[] | null; total: number | null }> {
    const query = supabase
      .from('food_trucks')
      .select('*', { count: 'exact' })
      .or(
        'current_location->>address.ilike.%, SC%,current_location->>address.ilike.% South Carolina%',
      )
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const response: PostgrestResponse<FoodTruck> = await query;
    const { data, error, count } = response;

    if (error) {
      throw error;
    }
    // Fix: Ensure 'data' is always defined (fallback to empty array if null)
    return { trucks: data ?? [], total: count ?? 0 };
  },

  async getTruckById(id: string): Promise<FoodTruck | null> {
    const response: PostgrestSingleResponse<FoodTruck> = await supabase
      .from('food_trucks')
      .select('*')
      .eq('id', id)
      .single();
    const { data, error } = response;

    if (error) throw error;
    return data;
  },

  async getTrucksByLocation(lat: number, lng: number, radius = 5): Promise<FoodTruck[] | null> {
    const response: PostgrestResponse<FoodTruck> = await supabase.rpc('get_trucks_near_location', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radius,
    });
    const { data, error } = response;

    if (error) throw error;
    return data;
  },

  async createTruck(truckData: Partial<FoodTruck>): Promise<FoodTruck | null> {
    const response: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
      .from('food_trucks')
      .insert([truckData])
      .select()
      .single();
    const { data, error } = response;

    if (error) throw error;
    return data;
  },

  async updateTruck(id: string, updates: Partial<FoodTruck>): Promise<FoodTruck | null> {
    const response: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
      .from('food_trucks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    const { data, error } = response;

    if (error) throw error;
    return data;
  },

  async updateDataQuality(id: string, score: number, _issues: string[]): Promise<FoodTruck | null> {
    const response: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
      .from('food_trucks')
      .update({
        data_quality_score: score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    const { data, error } = response;

    if (error) throw error;
    return data;
  },
};

// --------- API ROUTE HANDLERS ---------

import { type NextRequest, NextResponse } from 'next/server';
import { ScraperEngine, WebsiteScrapeData } from '@/lib/ScraperEngine'; // Using path alias
import { gemini } from '@/lib/gemini'; // Using path alias
import { EnhancedFoodTruckData, OperatingHours } from '@/lib/types'; // Import the new type
// FoodTruckService, ScrapingJobService, etc. are already defined in this file.

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PipelineRequestBody;
    const { target_url, job_type = 'website_scrape', priority = 1 } = body;

    if (!target_url) {
      return NextResponse.json({ error: 'target_url is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(target_url);
    } catch {
      return NextResponse.json({ error: 'Invalid target_url format' }, { status: 400 });
    }

    // 1. Create a new scraping job
    const job: ScrapingJob | null = await ScrapingJobService.createJob({
      target_url,
      job_type,
      status: 'running', // Simplified: set to running immediately
      priority,
      scheduled_at: new Date().toISOString(),
    });

    if (!job) {
      return NextResponse.json({ error: 'Failed to create scraping job' }, { status: 500 });
    }

    try {
      // 2. Initiate scraping
      const scraper = new ScraperEngine();
      const scrapeResult = await scraper.scrapeWebsite(target_url, { page_content: 'body' });

      if (!scrapeResult.success || !scrapeResult.data) {
        await ScrapingJobService.updateJobStatus(job.id, 'failed', {
          errors: [scrapeResult.error || 'Scraping failed'],
        });
        return NextResponse.json(
          { error: 'Scraping failed', job_id: job.id, details: scrapeResult.error },
          { status: 500 },
        );
      }

      const scrapedWebsiteData: WebsiteScrapeData = scrapeResult.data as WebsiteScrapeData;
      const geminiResponse = await gemini.enhanceFoodTruckData({
        scraped_data: scrapedWebsiteData,
        source_url: target_url,
      });

      if (!geminiResponse.success || !geminiResponse.data) {
        await ScrapingJobService.updateJobStatus(job.id, 'failed', {
          errors: [geminiResponse.error || 'Gemini processing failed'],
        });
        return NextResponse.json(
          { error: 'Gemini processing failed', job_id: job.id, details: geminiResponse.error },
          { status: 500 },
        );
      }
      const processedData: EnhancedFoodTruckData = geminiResponse.data;

      const currentLocationData = {
        address: 'Address not specified',
        lat: 0,
        lng: 0,
        timestamp: new Date().toISOString(),
      };

      const contactInfoData = {
        phone: processedData.cleaned_contact?.phone || undefined,
        email: processedData.cleaned_contact?.email || undefined,
        website: processedData.cleaned_contact?.website || undefined,
      };

      const socialMediaData = {
        instagram: undefined,
        facebook: undefined,
        twitter: undefined,
      };
      const truckPayload: Partial<FoodTruck> = {
        name: processedData.name || 'Unknown Truck Name',
        description: processedData.description || 'No description available.',
        current_location: currentLocationData,
        scheduled_locations: [],
        operating_hours: {
          monday: processedData.standardized_hours?.monday || { closed: true },
          tuesday: processedData.standardized_hours?.tuesday || { closed: true },
          wednesday: processedData.standardized_hours?.wednesday || { closed: true },
          thursday: processedData.standardized_hours?.thursday || { closed: true },
          friday: processedData.standardized_hours?.friday || { closed: true },
          saturday: processedData.standardized_hours?.saturday || { closed: true },
          sunday: processedData.standardized_hours?.sunday || { closed: true },
        },
        menu:
          processedData.enhanced_menu?.categories.map((category) => ({
            category: category.name,
            items: category.items.map((item) => ({
              name: item.name,
              description: item.description || '',
              price: typeof item.price === 'number' ? item.price : 0,
              dietary_tags: item.dietary_tags || [],
            })),
          })) || [],
        contact_info: contactInfoData,
        social_media: socialMediaData,
        cuisine_type: processedData.cuisine_type || [],
        price_range: processedData.price_range || undefined,
        source_urls: [target_url],
        data_quality_score: processedData.confidence_score || 0.5,
        verification_status: 'pending',
        last_scraped_at: new Date().toISOString(),
      };

      const savedTruck: FoodTruck | null = await FoodTruckService.createTruck(truckPayload);

      if (!savedTruck) {
        await ScrapingJobService.updateJobStatus(job.id, 'failed', {
          errors: ['Failed to save food truck data.'],
        });
        return NextResponse.json(
          { error: 'Failed to save food truck data', job_id: job.id },
          { status: 500 },
        );
      }

      await ScrapingJobService.updateJobStatus(job.id, 'completed', {
        data_collected: {
          truck_id: savedTruck.id,
          truck_name: savedTruck.name,
        },
      });

      return NextResponse.json({
        message: 'Pipeline triggered and processed successfully',
        job_id: job.id,
        truck_id: savedTruck.id,
      });
    } catch (pipelineError: unknown) {
      console.error(`Pipeline error for job ${job.id} and URL ${target_url}:`, pipelineError);
      const errorMessage =
        pipelineError instanceof Error ? pipelineError.message : 'Unknown pipeline error';
      await ScrapingJobService.updateJobStatus(job.id, 'failed', { errors: [errorMessage] });
      return NextResponse.json(
        { error: 'Pipeline processing error', job_id: job.id, details: errorMessage },
        { status: 500 },
      );
    }
  } catch (error: unknown) {
    console.error('Error in pipeline trigger endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      { error: 'Failed to trigger pipeline', details: errorMessage },
      { status: 500 },
    );
  }
}

// Scraping job operations
export const ScrapingJobService = {
  async createJob(jobData: Partial<ScrapingJob>): Promise<ScrapingJob | null> {
    const response: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
      .from('scraping_jobs')
      .insert([
        {
          ...jobData,
          status: 'pending',
          retry_count: 0,
          max_retries: 3,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    const { data, error } = response;

    if (error) throw error;
    return data;
  },

  async getJobsByStatus(status: string): Promise<ScrapingJob[] | null> {
    const response: PostgrestResponse<ScrapingJob> = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('status', status)
      .order('priority', { ascending: false })
      .order('scheduled_at', { ascending: true });
    const { data, error } = response;

    if (error) throw error;
    return data;
  },

  async updateJobStatus(
    id: string,
    status: string,
    updates: Partial<ScrapingJob> = {},
  ): Promise<ScrapingJob | null> {
    const response: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
      .from('scraping_jobs')
      .update({
        status,
        ...updates,
        ...(status === 'running' && { started_at: new Date().toISOString() }),
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();
    const { data, error } = response;

    if (error) throw error;
    return data;
  },
  async incrementRetryCount(id: string): Promise<ScrapingJob | null> {
    const fetchResponse: PostgrestSingleResponse<{ retry_count: number }> = await supabaseAdmin
      .from('scraping_jobs')
      .select('retry_count')
      .eq('id', id)
      .single();
    const { data: currentJob, error: fetchError } = fetchResponse;

    if (fetchError) throw fetchError;

    const updateResponse: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
      .from('scraping_jobs')
      .update({
        retry_count: (currentJob?.retry_count || 0) + 1,
      })
      .eq('id', id)
      .select()
      .single();
    const { data, error } = updateResponse;

    if (error) throw error;
    return data;
  },
};

// Data processing queue operations
export const DataProcessingService = {
  async addToQueue(queueData: Partial<DataProcessingQueue>): Promise<DataProcessingQueue | null> {
    const response: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
      .from('data_processing_queue')
      .insert([
        {
          ...queueData,
          status: 'pending',
          gemini_tokens_used: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    const { data, error } = response;

    if (error) throw error;
    return data;
  },

  async getNextQueueItem(): Promise<DataProcessingQueue | null> {
    const response: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
      .from('data_processing_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    const { data, error } = response;

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateQueueItem(
    id: string,
    updates: Partial<DataProcessingQueue>,
  ): Promise<DataProcessingQueue | null> {
    const response: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
      .from('data_processing_queue')
      .update({
        ...updates,
        ...(updates.status === 'completed' && { processed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();
    const { data, error } = response;

    if (error) throw error;
    return data;
  },
};

// API usage tracking
export const APIUsageService = {
  async trackUsage(
    serviceName: string,
    requests: number,
    tokens: number,
  ): Promise<{
    id: string;
    service_name: string;
    usage_date: string;
    requests_count: number;
    tokens_used: number;
  } | null> {
    const today = new Date().toISOString().split('T')[0];

    const fetchResponse: PostgrestSingleResponse<{ requests_count: number; tokens_used: number }> =
      await supabaseAdmin
        .from('api_usage')
        .select('requests_count, tokens_used')
        .eq('service_name', serviceName)
        .eq('usage_date', today)
        .single();
    const { data: existing, error: fetchError } = fetchResponse;

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const upsertResponse: PostgrestSingleResponse<{
      id: string;
      service_name: string;
      usage_date: string;
      requests_count: number;
      tokens_used: number;
    }> = await supabaseAdmin
      .from('api_usage')
      .upsert(
        {
          service_name: serviceName,
          usage_date: today,
          requests_count: (existing?.requests_count || 0) + requests,
          tokens_used: (existing?.tokens_used || 0) + tokens,
        },
        {
          onConflict: 'service_name,usage_date',
        },
      )
      .select()
      .single();
    const { data, error } = upsertResponse;

    if (error) throw error;
    return data;
  },

  async getTodayUsage(
    serviceName: string,
  ): Promise<{
    id: string;
    service_name: string;
    usage_date: string;
    requests_count: number;
    tokens_used: number;
  } | null> {
    const today = new Date().toISOString().split('T')[0];

    const response: PostgrestSingleResponse<{
      id: string;
      service_name: string;
      usage_date: string;
      requests_count: number;
      tokens_used: number;
    }> = await supabase
      .from('api_usage')
      .select('*')
      .eq('service_name', serviceName)
      .eq('usage_date', today)
      .single();
    const { data, error } = response;

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};
