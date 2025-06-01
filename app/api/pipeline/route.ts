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
