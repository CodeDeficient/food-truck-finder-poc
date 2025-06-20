export type Json =
  | string
  | number
  | boolean
  | undefined
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      food_trucks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | undefined
          current_location: Json
          scheduled_locations: Json | undefined
          operating_hours: Json | undefined
          menu: Json | undefined
          contact_info: Json | undefined
          social_media: Json | undefined
          cuisine_type: string[] | undefined
          price_range: string | undefined
          specialties: string[] | undefined
          data_quality_score: number | undefined
          verification_status: 'pending' | 'verified' | 'flagged' | 'rejected'
          source_urls: string[] | undefined
          last_scraped_at: string | undefined
          exact_location: Json | undefined
          city_location: Json | undefined
          user_id: string | undefined
          average_rating: number | undefined
          review_count: number | undefined
          last_updated_at: string | undefined
          is_active: boolean | undefined
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | undefined
          current_location: Json
          scheduled_locations?: Json | undefined
          operating_hours?: Json | undefined
          menu?: Json | undefined
          contact_info?: Json | undefined
          social_media?: Json | undefined
          cuisine_type?: string[] | undefined
          price_range?: string | undefined
          specialties?: string[] | undefined
          data_quality_score?: number | undefined
          verification_status?: 'pending' | 'verified' | 'flagged' | 'rejected'
          source_urls?: string[] | undefined
          last_scraped_at?: string | undefined
          exact_location?: Json | undefined
          city_location?: Json | undefined
          user_id?: string | undefined
          average_rating?: number | undefined
          review_count?: number | undefined
          last_updated_at?: string | undefined
          is_active?: boolean | undefined
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | undefined
          current_location?: Json
          scheduled_locations?: Json | undefined
          operating_hours?: Json | undefined
          menu?: Json | undefined
          contact_info?: Json | undefined
          social_media?: Json | undefined
          cuisine_type?: string[] | undefined
          price_range?: string | undefined
          specialties?: string[] | undefined
          data_quality_score?: number | undefined
          verification_status?: 'pending' | 'verified' | 'flagged' | 'rejected'
          source_urls?: string[] | undefined
          last_scraped_at?: string | undefined
          exact_location?: Json | undefined
          city_location?: Json | undefined
          user_id?: string | undefined
          average_rating?: number | undefined
          review_count?: number | undefined
          last_updated_at?: string | undefined
          is_active?: boolean | undefined
        }
      }
      scraping_jobs: {
        Row: {
          id: string
          job_type: string
          target_url: string | undefined
          target_handle: string | undefined
          platform: string | undefined
          status: 'pending' | 'running' | 'completed' | 'failed'
          priority: number
          scheduled_at: string
          started_at: string | undefined
          completed_at: string | undefined
          data_collected: Json | undefined
          errors: string[] | undefined
          retry_count: number
          max_retries: number
          created_at: string
        }
        Insert: {
          id?: string
          job_type: string
          target_url?: string | undefined
          target_handle?: string | undefined
          platform?: string | undefined
          status?: 'pending' | 'running' | 'completed' | 'failed'
          priority?: number
          scheduled_at?: string
          started_at?: string | undefined
          completed_at?: string | undefined
          data_collected?: Json | undefined
          errors?: string[] | undefined
          retry_count?: number
          max_retries?: number
          created_at?: string
        }
        Update: {
          id?: string
          job_type?: string
          target_url?: string | undefined
          target_handle?: string | undefined
          platform?: string | undefined
          status?: 'pending' | 'running' | 'completed' | 'failed'
          priority?: number
          scheduled_at?: string
          started_at?: string | undefined
          completed_at?: string | undefined
          data_collected?: Json | undefined
          errors?: string[] | undefined
          retry_count?: number
          max_retries?: number
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          food_truck_id: string | undefined
          title: string
          description: string | undefined
          event_date: string
          start_time: string | undefined
          end_time: string | undefined
          location_address: string | undefined
          location_lat: number | undefined
          location_lng: number | undefined
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          food_truck_id?: string | undefined
          title: string
          description?: string | undefined
          event_date: string
          start_time?: string | undefined
          end_time?: string | undefined
          location_address?: string | undefined
          location_lat?: number | undefined
          location_lng?: number | undefined
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          food_truck_id?: string | undefined
          title?: string
          description?: string | undefined
          event_date?: string
          start_time?: string | undefined
          end_time?: string | undefined
          location_address?: string | undefined
          location_lat?: number | undefined
          location_lng?: number | undefined
          created_at?: string
          updated_at?: string
        }
      }
      discovered_urls: {
        Row: {
          id: string
          url: string
          source_directory_url: string | undefined
          region: string | undefined
          status: 'new' | 'processing' | 'processed' | 'irrelevant' | 'failed'
          discovery_method: 'manual' | 'autonomous_search' | 'tavily_search' | 'firecrawl_crawl' | 'directory_crawl'
          discovered_at: string
          last_processed_at: string | undefined
          processing_attempts: number
          notes: string | undefined
          metadata: Json | undefined
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          source_directory_url?: string | undefined
          region?: string | undefined
          status?: 'new' | 'processing' | 'processed' | 'irrelevant' | 'failed'
          discovery_method?: 'manual' | 'autonomous_search' | 'tavily_search' | 'firecrawl_crawl' | 'directory_crawl'
          discovered_at?: string
          last_processed_at?: string | undefined
          processing_attempts?: number
          notes?: string | undefined
          metadata?: Json | undefined
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          source_directory_url?: string | undefined
          region?: string | undefined
          status?: 'new' | 'processing' | 'processed' | 'irrelevant' | 'failed'
          discovery_method?: 'manual' | 'autonomous_search' | 'tavily_search' | 'firecrawl_crawl' | 'directory_crawl'
          discovered_at?: string
          last_processed_at?: string | undefined
          processing_attempts?: number
          notes?: string | undefined
          metadata?: Json | undefined
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string | undefined
          full_name: string | undefined
          avatar_url: string | undefined
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | undefined
          full_name?: string | undefined
          avatar_url?: string | undefined
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | undefined
          full_name?: string | undefined
          avatar_url?: string | undefined
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
