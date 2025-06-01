import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Database types
export interface FoodTruck {
  id: string
  name: string
  description?: string
  current_location: {
    lat: number
    lng: number
    address: string
    timestamp: string
  }
  scheduled_locations: Array<{
    lat: number
    lng: number
    start_time: string
    end_time: string
  }>
  operating_hours: Record<string, { open: string; close: string; closed: boolean }>
  menu: Array<{
    category: string
    items: Array<{
      name: string
      description: string
      price: number
      dietary_tags: string[]
    }>
  }>
  contact_info: {
    phone?: string
    email?: string
    website?: string
  }
  social_media: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  data_quality_score: number
  verification_status: "pending" | "verified" | "flagged"
  source_urls: string[]
  created_at: string
  updated_at: string
  last_scraped_at?: string
}

export interface ScrapingJob {
  id: string
  job_type: string
  target_url?: string
  target_handle?: string
  platform?: string
  status: "pending" | "running" | "completed" | "failed"
  priority: number
  scheduled_at: string
  started_at?: string
  completed_at?: string
  data_collected?: any
  errors?: string[]
  retry_count: number
  max_retries: number
  created_at: string
}

export interface DataProcessingQueue {
  id: string
  truck_id: string
  processing_type: string
  raw_data: any
  processed_data?: any
  gemini_tokens_used: number
  status: "pending" | "processing" | "completed" | "failed"
  priority: number
  created_at: string
  processed_at?: string
}

// Food truck operations
export class FoodTruckService {
  static async getAllTrucks(limit = 50, offset = 0) {
    // Construct the query
    let query = supabase
      .from("food_trucks")
      .select("*", { count: "exact" })
      // Filter by address containing ", SC" or " South Carolina" (case-insensitive)
      // Assumes 'current_location' is a JSONB field with an 'address' key.
      .or("current_location->>address.ilike.%, SC%,current_location->>address.ilike.% South Carolina%")
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { trucks: data, total: count };
  }

  static async getTruckById(id: string) {
    const { data, error } = await supabase.from("food_trucks").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async getTrucksByLocation(lat: number, lng: number, radius = 5) {
    // Using PostGIS functions for geospatial queries
    const { data, error } = await supabase.rpc("get_trucks_near_location", {
      user_lat: lat,
      user_lng: lng,
      radius_km: radius,
    })

    if (error) throw error
    return data
  }

  static async createTruck(truckData: Partial<FoodTruck>) {
    const { data, error } = await supabaseAdmin.from("food_trucks").insert([truckData]).select().single()

    if (error) throw error
    return data
  }

  static async updateTruck(id: string, updates: Partial<FoodTruck>) {
    const { data, error } = await supabaseAdmin.from("food_trucks").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async updateDataQuality(id: string, score: number, issues: string[]) {
    const { data, error } = await supabaseAdmin
      .from("food_trucks")
      .update({
        data_quality_score: score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// --------- API ROUTE HANDLERS ---------

import { type NextRequest, NextResponse } from "next/server";
import { ScraperEngine } from "@/lib/scraper-engine"; // Using path alias
import { gemini } from "@/lib/gemini"; // Using path alias
// FoodTruckService, ScrapingJobService, etc. are already defined in this file.

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { target_url, job_type = "website_scrape", priority = 1 } = body;

        if (!target_url) {
            return NextResponse.json({ error: "target_url is required" }, { status: 400 });
        }

        // Basic URL validation
        try {
            new URL(target_url);
        } catch (_) {
            return NextResponse.json({ error: "Invalid target_url format" }, { status: 400 });
        }

        // 1. Create a new scraping job
        const job = await ScrapingJobService.createJob({
            target_url,
            job_type,
            status: "running", // Simplified: set to running immediately
            priority,
            scheduled_at: new Date().toISOString(),
        });

        try {
            // 2. Initiate scraping
            const scraper = new ScraperEngine();
            // Using a generic selector to get the main content of the page for Gemini processing
            const scrapeResult = await scraper.scrapeWebsite(target_url, { page_content: "body" });

            if (!scrapeResult.success || !scrapeResult.data) {
                await ScrapingJobService.updateJobStatus(job.id, "failed", { errors: [scrapeResult.error || "Scraping failed"] });
                return NextResponse.json({ error: "Scraping failed", job_id: job.id, details: scrapeResult.error }, { status: 500 });
            }

            // 3. Process scraped content with Gemini
            // Pass the scraped content (assuming it's somewhat structured or just raw text/HTML)
            // The current `enhanceFoodTruckData` expects a JSON object as `rawData`.
            // The scraper with `page_content: "body"` will return `data: { page_content: "<html>..." }`. This fits.
            const geminiResponse = await gemini.enhanceFoodTruckData({
              scraped_data: scrapeResult.data, // Pass the output of scrapeWebsite
              source_url: target_url
            });

            if (!geminiResponse.success || !geminiResponse.data) {
                await ScrapingJobService.updateJobStatus(job.id, "failed", { errors: [geminiResponse.error || "Gemini processing failed"] });
                return NextResponse.json({ error: "Gemini processing failed", job_id: job.id, details: geminiResponse.error }, { status: 500 });
            }

            const processedData = geminiResponse.data;

            // 4. Save processed data to FoodTrucks table
            // Adapt processedData from Gemini to Partial<FoodTruck> with defensive defaults
            const rawLocation = processedData.current_location || processedData.location || {};
            const currentLocationData = {
                address: rawLocation.address || "Address not specified",
                lat: parseFloat(rawLocation.lat) || 0.0, // Default to 0.0 if not parseable or missing, as schema requires number
                lng: parseFloat(rawLocation.lng) || 0.0, // Default to 0.0 if not parseable or missing, as schema requires number
                timestamp: rawLocation.timestamp || new Date().toISOString(),
                // notes: rawLocation.notes || "", // 'notes' is not in the FoodTruck interface for current_location
            };

            const rawContact = processedData.contact_info || processedData.cleaned_contact || {};
            const contactInfoData = {
                phone: rawContact.phone || rawContact.phone_number || null, // Accommodate both from prompt
                email: rawContact.email || null,
                website: rawContact.website || null,
            };

            const rawSocial = processedData.social_media || rawContact.social_media || {}; // Social might be part of contact from Gemini
            const socialMediaData = {
              instagram: rawSocial.instagram || null,
              facebook: rawSocial.facebook || null,
              twitter: rawSocial.twitter || null,
            };

            const truckPayload: Partial<FoodTruck> = {
                name: processedData.name || "Unknown Truck Name",
                description: processedData.description || "No description available.",
                current_location: currentLocationData,
                scheduled_locations: processedData.scheduled_locations || [], // Default to empty array
                operating_hours: processedData.standardized_hours || processedData.operating_hours || {}, // Default to empty object
                menu: processedData.enhanced_menu || processedData.menu || [], // Default to empty array
                contact_info: contactInfoData,
                social_media: socialMediaData,

                // Optional fields from Gemini or other processing steps (not strictly in FoodTruck interface yet but often desired)
                // cuisine_type: processedData.cuisine_type || [], // Assuming array, if not in interface, handle as any
                // price_range: processedData.price_range || null,
                // payment_methods: Array.isArray(processedData.payment_methods) ? processedData.payment_methods : [],
                // images: Array.isArray(processedData.images) ? processedData.images : [],
                // dietary_tags: Array.isArray(processedData.dietary_tags) ? processedData.dietary_tags : [], // These are distinct from menu item tags
                // rating: parseFloat(processedData.rating) || null,

                source_urls: [target_url],
                data_quality_score: parseFloat(processedData.confidence_score) || parseFloat(processedData.data_quality_score) || 0.5, // Default to 0.5
                verification_status: "pending",
                last_scraped_at: new Date().toISOString(),
            };

            // Ensure required sub-fields for current_location are not null if DB doesn't allow, though interface implies they are required.
            // The parseFloat above with || 0.0 handles lat/lng for the interface's `number` type.
            // Address defaults to "Address not specified". Timestamp defaults to now.

            // Simplified: Create new truck. No explicit check for existing truck from this source.
            // In a full system, you'd query for `source_urls` containing `target_url`
            // and decide whether to create or update.
            const savedTruck = await FoodTruckService.createTruck(truckPayload);

            // 5. Update job status to "completed"
            await ScrapingJobService.updateJobStatus(job.id, "completed", {
              data_collected: {
                truck_id: savedTruck.id,
                truck_name: savedTruck.name
              }
            });

            return NextResponse.json({
              message: "Pipeline triggered and processed successfully",
              job_id: job.id,
              truck_id: savedTruck.id
            });

        } catch (pipelineError: any) {
            console.error(`Pipeline error for job ${job.id} and URL ${target_url}:`, pipelineError);
            await ScrapingJobService.updateJobStatus(job.id, "failed", { errors: [pipelineError.message || "Unknown pipeline error"] });
            return NextResponse.json({ error: "Pipeline processing error", job_id: job.id, details: pipelineError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Error in pipeline trigger endpoint:", error);
        // Do not include error.stack in client-facing response for security
        return NextResponse.json({ error: "Failed to trigger pipeline", details: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}

// Scraping job operations
export class ScrapingJobService {
  static async createJob(jobData: Partial<ScrapingJob>) {
    const { data, error } = await supabaseAdmin
      .from("scraping_jobs")
      .insert([
        {
          ...jobData,
          status: "pending",
          retry_count: 0,
          max_retries: 3,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getJobsByStatus(status: string) {
    const { data, error } = await supabase
      .from("scraping_jobs")
      .select("*")
      .eq("status", status)
      .order("priority", { ascending: false })
      .order("scheduled_at", { ascending: true })

    if (error) throw error
    return data
  }

  static async updateJobStatus(id: string, status: string, updates: Partial<ScrapingJob> = {}) {
    const { data, error } = await supabaseAdmin
      .from("scraping_jobs")
      .update({
        status,
        ...updates,
        ...(status === "running" && { started_at: new Date().toISOString() }),
        ...(status === "completed" && { completed_at: new Date().toISOString() }),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async incrementRetryCount(id: string) {
    const { data, error } = await supabaseAdmin
      .from("scraping_jobs")
      .update({
        retry_count: supabase.raw("retry_count + 1"),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Data processing queue operations
export class DataProcessingService {
  static async addToQueue(queueData: Partial<DataProcessingQueue>) {
    const { data, error } = await supabaseAdmin
      .from("data_processing_queue")
      .insert([
        {
          ...queueData,
          status: "pending",
          gemini_tokens_used: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getNextQueueItem() {
    const { data, error } = await supabaseAdmin
      .from("data_processing_queue")
      .select("*")
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async updateQueueItem(id: string, updates: Partial<DataProcessingQueue>) {
    const { data, error } = await supabaseAdmin
      .from("data_processing_queue")
      .update({
        ...updates,
        ...(updates.status === "completed" && { processed_at: new Date().toISOString() }),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// API usage tracking
export class APIUsageService {
  static async trackUsage(serviceName: string, requests: number, tokens: number) {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabaseAdmin
      .from("api_usage")
      .upsert(
        {
          service_name: serviceName,
          usage_date: today,
          requests_count: supabase.raw(`requests_count + ${requests}`),
          tokens_used: supabase.raw(`tokens_used + ${tokens}`),
        },
        {
          onConflict: "service_name,usage_date",
        },
      )
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getTodayUsage(serviceName: string) {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("api_usage")
      .select("*")
      .eq("service_name", serviceName)
      .eq("usage_date", today)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }
}
