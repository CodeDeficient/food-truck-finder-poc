import { ReactElement } from 'react';
export type PriceRange = '$' | '$$' | '$$$' | '$$$$' | undefined;
export type DailyOperatingHours = {
    open: string;
    close: string;
    closed?: boolean;
} | {
    closed: true;
} | undefined;
export interface OperatingHours {
    monday: DailyOperatingHours;
    tuesday: DailyOperatingHours;
    wednesday: DailyOperatingHours;
    thursday: DailyOperatingHours;
    friday: DailyOperatingHours;
    saturday: DailyOperatingHours;
    sunday: DailyOperatingHours;
    [key: string]: DailyOperatingHours;
}
export interface MenuCategory {
    name: string;
    items: MenuItem[];
}
export interface MenuItem {
    name: string;
    description: string | undefined;
    price: number | string | undefined;
    dietary_tags: string[];
    is_popular?: boolean;
}
export interface UserCoordinates {
    lat: number;
    lng: number;
}
export interface LocationData {
    address: string | undefined;
    city: string | undefined;
    state: string | undefined;
    landmarks: string[];
    coordinates: UserCoordinates;
    confidence: number;
    raw_location_text: string | undefined;
}
export interface ExtractedFoodTruckDetails {
    name: string | undefined;
    description: string | undefined;
    cuisine_type: string[];
    price_range: PriceRange | undefined;
    specialties: string[];
    current_location: {
        address: string | undefined;
        city: string | undefined;
        state: string | undefined;
        zip_code: string | undefined;
        lat?: number;
        lng?: number;
        raw_text: string | undefined;
    };
    scheduled_locations?: {
        address?: string;
        city?: string;
        state?: string;
        zip_code?: string;
        lat?: number;
        lng?: number;
        timestamp: string;
        start_time: string;
        end_time: string;
    }[];
    operating_hours: OperatingHours;
    menu: MenuCategory[];
    contact_info: {
        phone?: string;
        email?: string;
        website?: string;
    };
    social_media: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        tiktok?: string;
        yelp?: string;
    };
    source_url: string;
}
export interface FirecrawlOutputData {
    markdown: string;
    name?: string;
    source_url?: string;
}
export interface FoodTruckSchema {
    name: string;
    description: string | undefined;
    current_location: {
        lat: number;
        lng: number;
        address: string | undefined;
        timestamp: string;
    };
    scheduled_locations: ExtractedFoodTruckDetails['scheduled_locations'];
    operating_hours: OperatingHours;
    menu: MenuCategory[];
    contact_info: {
        phone?: string;
        email?: string;
        website?: string;
    };
    social_media: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        tiktok?: string;
        yelp?: string;
    };
    cuisine_type: string[];
    price_range: PriceRange | undefined;
    specialties: string[];
    data_quality_score: number;
    verification_status: 'pending' | 'verified' | 'flagged';
    source_urls: string[];
    last_scraped_at: string;
    test_run_flag?: boolean;
    website?: string;
    phone_number?: string;
    email?: string;
    instagram_handle?: string;
    facebook_handle?: string;
    twitter_handle?: string;
    schedule?: unknown[];
    average_rating?: number;
    review_count?: number;
}
export interface FoodTruck extends FoodTruckSchema {
    id: string;
    created_at: string;
    updated_at: string;
    last_updated_at?: string;
    user_id?: string;
    state?: string;
    is_active?: boolean;
    image_url?: string;
    average_rating?: number;
    review_count?: number;
    exact_location?: any;
    city_location?: any;
}
export interface GeminiResponse<T = unknown> {
    success: boolean;
    data?: T;
    tokensUsed?: number;
    error?: string;
    promptSent?: string;
}
export interface StageResult {
    status: string;
    data?: FirecrawlOutputData | ExtractedFoodTruckDetails | FoodTruckSchema;
    error?: string;
    details?: string;
    prompt?: string;
    tokensUsed?: number;
    metadata?: {
        name?: string;
        source_url?: string;
    };
    rawContent?: string;
    preparedData?: FoodTruckSchema;
    recordId?: string;
}
export interface TestPipelineResults {
    firecrawl?: StageResult;
    gemini?: StageResult;
    supabase?: StageResult;
    overallStatus?: string;
    logs?: string[];
    error?: string;
}
export interface PipelineRunResult {
    firecrawl?: StageResult;
    gemini?: StageResult;
    supabase?: StageResult;
    logs: string[];
    overallStatus: 'Success' | 'Error';
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
export interface RealtimeMetrics {
    scrapingJobs: {
        active: number;
        completed: number;
        failed: number;
        pending: number;
    };
    dataQuality: {
        averageScore: number;
        totalTrucks: number;
        recentChanges: number;
    };
    systemHealth: {
        status: 'healthy' | 'warning' | 'error';
        uptime: number;
        lastUpdate: string;
    };
}
export interface TruckRating {
    id: number;
    title: string;
    score: number;
}
export interface PipelineEvent {
    type: string;
    payload: Record<string, unknown>;
    timestamp: string;
}
export interface SentimentAnalysisResult {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    key_topics: string[];
    positive_aspects: string[];
    negative_aspects: string[];
    summary: string;
    recommended: boolean;
}
export interface EnhancedFoodTruckData {
    name: string | undefined;
    description: string | undefined;
    cuisine_type: string[];
    price_range: PriceRange;
    specialties: string[];
    dietary_options: string[];
    enhanced_menu: {
        categories: MenuCategory[];
    };
    standardized_hours: OperatingHours;
    cleaned_contact: {
        phone: string | undefined;
        email: string | undefined;
        website: string | undefined;
    };
    data_quality_improvements: string[];
    confidence_score: number;
}
export interface DataProcessingQueue {
    id: string;
    truck_id?: string;
    processing_type: string;
    raw_data: Record<string, unknown>;
    processed_data?: Record<string, unknown>;
    gemini_tokens_used: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    priority: number;
    created_at: string;
    processed_at?: string;
}
export interface ApiUsage {
    id: string;
    service_name: string;
    usage_date: string;
    requests_count: number;
    tokens_used: number;
}
export interface QualityCategory {
    name: string;
    score: number;
    issues: string[];
}
export interface SystemAlert {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface RealtimeAdminEvent {
    type: string;
    payload: Record<string, unknown>;
    timestamp: string;
}
export interface FoodTruckWithRatings extends FoodTruck {
    ratings?: TruckRating[];
}
export interface SecurityEvent {
    event_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    details: Record<string, unknown>;
}
export interface APIService {
    name: string;
    endpoint: string;
    status: 'active' | 'inactive';
}
export interface Database {
    public: {
        tables: Record<string, unknown>;
    };
}
export type CleanupOperationType = 'normalize_phone' | 'fix_coordinates' | 'remove_placeholders' | 'update_quality_scores' | 'merge_duplicates';
export interface CleanupOperation {
    type: CleanupOperationType;
    description: string;
    affectedCount: number;
    successCount: number;
    errorCount: number;
    errors: string[];
}
export interface BatchCleanupResult {
    totalProcessed: number;
    operations: CleanupOperation[];
    summary: {
        trucksImproved: number;
        duplicatesRemoved: number;
        qualityScoreImprovement: number;
        placeholdersRemoved: number;
    };
    duration: number;
}
export interface DataCleanupRequestBody {
    action: string;
    options?: {
        batchSize?: number;
        dryRun?: boolean;
        operations?: string[];
        truckData?: Record<string, unknown>;
        targetId?: string;
        sourceId?: string;
    };
}
export interface FirecrawlRequestBody {
    url: string;
    extractorOptions?: Record<string, unknown>;
}
export interface TavilyRequestBody {
    query: string;
    searchDepth?: 'basic' | 'advanced';
    includeImages?: boolean;
    includeAnswer?: boolean;
    maxResults?: number;
}
export interface PostRequestBody {
    action: string;
    data?: Record<string, unknown>;
}
export interface PutRequestBody {
    id: string;
    updates: Record<string, unknown>;
}
export interface ButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}
export interface ToasterToast {
    id: string;
    title?: string;
    description?: string;
    action?: ReactElement;
    variant?: 'default' | 'destructive';
}
export interface ToastComponentProps {
    toast: ToasterToast;
}
export interface ToastActionElement {
    altText: string;
    element: ReactElement;
}
export interface CleanupResult {
    success: boolean;
    totalProcessed: number;
    operations: CleanupOperation[];
    summary: {
        trucksImproved: number;
        duplicatesRemoved: number;
        qualityScoreImprovement: number;
        placeholdersRemoved: number;
    };
    duration: number;
    error?: string;
}
export interface RequestBody {
    action: string;
    options?: Record<string, unknown>;
}
export interface FirecrawlResponse {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
}
