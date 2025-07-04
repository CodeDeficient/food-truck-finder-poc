export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_usage: {
        Row: {
          created_at: string | null
          id: string
          requests_count: number | null
          requests_limit: number | null
          service_name: string
          tokens_limit: number | null
          tokens_used: number | null
          usage_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          requests_count?: number | null
          requests_limit?: number | null
          service_name: string
          tokens_limit?: number | null
          tokens_used?: number | null
          usage_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          requests_count?: number | null
          requests_limit?: number | null
          service_name?: string
          tokens_limit?: number | null
          tokens_used?: number | null
          usage_date?: string | null
        }
        Relationships: []
      }
      data_processing_queue: {
        Row: {
          created_at: string | null
          gemini_tokens_used: number | null
          id: string
          priority: number | null
          processed_at: string | null
          processed_data: Json | null
          processing_type: string
          raw_data: Json
          status: string | null
          truck_id: string | null
        }
        Insert: {
          created_at?: string | null
          gemini_tokens_used?: number | null
          id?: string
          priority?: number | null
          processed_at?: string | null
          processed_data?: Json | null
          processing_type: string
          raw_data: Json
          status?: string | null
          truck_id?: string | null
        }
        Update: {
          created_at?: string | null
          gemini_tokens_used?: number | null
          id?: string
          priority?: number | null
          processed_at?: string | null
          processed_data?: Json | null
          processing_type?: string
          raw_data?: Json
          status?: string | null
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_processing_queue_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "food_trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          food_truck_id: string
          id: string
          location: string
          time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          food_truck_id: string
          id?: string
          location: string
          time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          food_truck_id?: string
          id?: string
          location?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_food_truck_id_fkey"
            columns: ["food_truck_id"]
            isOneToOne: false
            referencedRelation: "food_trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      food_truck_schedules: {
        Row: {
          created_at: string | null
          day_of_week: string
          end_time: string
          food_truck_id: string
          id: string
          is_recurring: boolean | null
          location: string | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          end_time: string
          food_truck_id: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          food_truck_id?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_truck_schedules_food_truck_id_fkey"
            columns: ["food_truck_id"]
            isOneToOne: false
            referencedRelation: "food_trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      food_trucks: {
        Row: {
          city_location: Json | null
          contact_info: Json | null
          created_at: string | null
          cuisine_type: string[] | null
          current_location: Json | null
          data_quality_score: number | null
          description: string | null
          exact_location: Json | null
          id: string
          last_scraped_at: string | null
          menu: Json | null
          name: string
          operating_hours: Json | null
          price_range: string | null
          scheduled_locations: Json | null
          social_media: Json | null
          source_urls: string[] | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          city_location?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          cuisine_type?: string[] | null
          current_location?: Json | null
          data_quality_score?: number | null
          description?: string | null
          exact_location?: Json | null
          id?: string
          last_scraped_at?: string | null
          menu?: Json | null
          name: string
          operating_hours?: Json | null
          price_range?: string | null
          scheduled_locations?: Json | null
          social_media?: Json | null
          source_urls?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          city_location?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          cuisine_type?: string[] | null
          current_location?: Json | null
          data_quality_score?: number | null
          description?: string | null
          exact_location?: Json | null
          id?: string
          last_scraped_at?: string | null
          menu?: Json | null
          name?: string
          operating_hours?: Json | null
          price_range?: string | null
          scheduled_locations?: Json | null
          social_media?: Json | null
          source_urls?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          dietary_tags: string[] | null
          food_truck_id: string | null
          id: string
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          food_truck_id?: string | null
          id?: string
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          food_truck_id?: string | null
          id?: string
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_food_truck_id_fkey"
            columns: ["food_truck_id"]
            isOneToOne: false
            referencedRelation: "food_trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      scraper_configs: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          error_count: number | null
          frequency_minutes: number | null
          id: string
          last_run_at: string | null
          name: string
          scraper_type: string
          selectors: Json | null
          success_count: number | null
          target_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          error_count?: number | null
          frequency_minutes?: number | null
          id?: string
          last_run_at?: string | null
          name: string
          scraper_type: string
          selectors?: Json | null
          success_count?: number | null
          target_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          error_count?: number | null
          frequency_minutes?: number | null
          id?: string
          last_run_at?: string | null
          name?: string
          scraper_type?: string
          selectors?: Json | null
          success_count?: number | null
          target_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scraping_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data_collected: Json | null
          errors: string[] | null
          id: string
          job_type: string
          max_retries: number | null
          platform: string | null
          priority: number | null
          retry_count: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          target_handle: string | null
          target_url: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data_collected?: Json | null
          errors?: string[] | null
          id?: string
          job_type: string
          max_retries?: number | null
          platform?: string | null
          priority?: number | null
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          target_handle?: string | null
          target_url?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data_collected?: Json | null
          errors?: string[] | null
          id?: string
          job_type?: string
          max_retries?: number | null
          platform?: string | null
          priority?: number | null
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          target_handle?: string | null
          target_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_data_quality_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_trucks: number
          avg_quality_score: number
          high_quality_count: number
          medium_quality_count: number
          low_quality_count: number
          verified_count: number
          pending_count: number
          flagged_count: number
        }[]
      }
      get_trucks_near_location: {
        Args:
          | { user_lat: number; user_lng: number; radius_km?: number }
          | { user_lat: number; user_lng: number; radius_km?: number }
        Returns: {
          id: string
          name: string
          description: string
          current_location: Json
          scheduled_locations: Json
          operating_hours: Json
          menu: Json
          contact_info: Json
          social_media: Json
          data_quality_score: number
          verification_status: string
          source_urls: string[]
          created_at: string
          updated_at: string
          last_scraped_at: string
          distance_km: number
        }[]
      }
      update_api_usage: {
        Args:
          | { p_service_name: string; p_requests?: number; p_tokens?: number }
          | { service: string; requests?: number; tokens?: number }
        Returns: {
          created_at: string | null
          id: string
          requests_count: number | null
          requests_limit: number | null
          service_name: string
          tokens_limit: number | null
          tokens_used: number | null
          usage_date: string | null
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
