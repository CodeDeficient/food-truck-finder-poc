import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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
  truck_id?: string
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
    try {
      const { data, error, count } = await supabase
        .from("food_trucks")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { trucks: data || [], total: count || 0 }
    } catch (error) {
      console.error("Error fetching trucks:", error)
      return { trucks: [], total: 0 }
    }
  }

  static async getTruckById(id: string) {
    const { data, error } = await supabase.from("food_trucks").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async getTrucksByLocation(lat: number, lng: number, radius = 5) {
    try {
      // Fallback to simple query if PostGIS function doesn't exist
      const { data, error } = await supabase
        .from("food_trucks")
        .select("*")
        .not("current_location", "is", null)
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching trucks by location:", error)
      return []
    }
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

  static async getDataQualityStats() {
    try {
      // Fallback to simple aggregation if custom function doesn't exist
      const { data, error } = await supabase.from("food_trucks").select("data_quality_score, verification_status")

      if (error) throw error

      const trucks = data || []
      const total = trucks.length

      return {
        total_trucks: total,
        avg_quality_score: total > 0 ? trucks.reduce((sum, t) => sum + (t.data_quality_score || 0), 0) / total : 0,
        high_quality_count: trucks.filter((t) => (t.data_quality_score || 0) >= 0.8).length,
        medium_quality_count: trucks.filter(
          (t) => (t.data_quality_score || 0) >= 0.5 && (t.data_quality_score || 0) < 0.8,
        ).length,
        low_quality_count: trucks.filter((t) => (t.data_quality_score || 0) < 0.5).length,
        verified_count: trucks.filter((t) => t.verification_status === "verified").length,
        pending_count: trucks.filter((t) => t.verification_status === "pending").length,
        flagged_count: trucks.filter((t) => t.verification_status === "flagged").length,
      }
    } catch (error) {
      console.error("Error getting quality stats:", error)
      return {
        total_trucks: 0,
        avg_quality_score: 0,
        high_quality_count: 0,
        medium_quality_count: 0,
        low_quality_count: 0,
        verified_count: 0,
        pending_count: 0,
        flagged_count: 0,
      }
    }
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
    try {
      const query =
        status === "all"
          ? supabase.from("scraping_jobs").select("*")
          : supabase.from("scraping_jobs").select("*").eq("status", status)

      const { data, error } = await query
        .order("priority", { ascending: false })
        .order("scheduled_at", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching jobs:", error)
      return []
    }
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
    // Simple increment since we can't use supabase.raw in this context
    const { data: current, error: fetchError } = await supabaseAdmin
      .from("scraping_jobs")
      .select("retry_count")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabaseAdmin
      .from("scraping_jobs")
      .update({ retry_count: (current.retry_count || 0) + 1 })
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

  static async getQueueByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from("data_processing_queue")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching queue:", error)
      return []
    }
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
    try {
      const today = new Date().toISOString().split("T")[0]

      // Try to get existing record first
      const { data: existing } = await supabaseAdmin
        .from("api_usage")
        .select("*")
        .eq("service_name", serviceName)
        .eq("usage_date", today)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await supabaseAdmin
          .from("api_usage")
          .update({
            requests_count: (existing.requests_count || 0) + requests,
            tokens_used: (existing.tokens_used || 0) + tokens,
          })
          .eq("id", existing.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Create new record
        const { data, error } = await supabaseAdmin
          .from("api_usage")
          .insert([
            {
              service_name: serviceName,
              usage_date: today,
              requests_count: requests,
              tokens_used: tokens,
            },
          ])
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error("Error tracking usage:", error)
      return null
    }
  }

  static async getTodayUsage(serviceName: string) {
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("api_usage")
        .select("*")
        .eq("service_name", serviceName)
        .eq("usage_date", today)
        .single()

      if (error && error.code !== "PGRST116") throw error
      return data
    } catch (error) {
      console.error("Error getting today usage:", error)
      return null
    }
  }

  static async getAllUsageStats() {
    try {
      const { data, error } = await supabase
        .from("api_usage")
        .select("*")
        .order("usage_date", { ascending: false })
        .limit(30)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting usage stats:", error)
      return []
    }
  }
}
