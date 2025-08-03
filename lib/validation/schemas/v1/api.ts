import { z } from 'zod';
import {
  EmailSchema,
  PhoneSchema,
  UrlSchema,
  CoordinatesSchema,
  PriceRangeSchema,
  ContactInfoSchema,
  SocialMediaSchema,
  OperatingHoursSchema,
  DailyOperatingHoursSchema,
  toJSON
} from './common';

// Menu item schema
export const MenuItemSchema = z.object({
  name: z.string().min(1, 'Menu item name is required'),
  description: z.string().optional().default(''),
  price: z.union([z.number().min(0), z.string()]).optional().default(0),
  dietary_tags: z.array(z.string()).optional().default([]),
  is_popular: z.boolean().optional().default(false)
});

// Menu category schema
export const MenuCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  items: z.array(MenuItemSchema).default([])
});

// Location schemas
export const CurrentLocationSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  address: z.string().optional(),
  timestamp: z.string().datetime().optional().default(() => new Date().toISOString())
});

export const ScheduledLocationSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  timestamp: z.string().datetime(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime()
});

// Food truck creation schema
export const CreateFoodTruckSchema = z.object({
  name: z.string().min(1, 'Food truck name is required'),
  description: z.string().optional(),
  current_location: CurrentLocationSchema.optional(),
  scheduled_locations: z.array(ScheduledLocationSchema).optional().default([]),
  operating_hours: OperatingHoursSchema.optional().default({
    monday: { closed: true },
    tuesday: { closed: true },
    wednesday: { closed: true },
    thursday: { closed: true },
    friday: { closed: true },
    saturday: { closed: true },
    sunday: { closed: true }
  }),
  menu: z.array(MenuCategorySchema).optional().default([]),
  contact_info: ContactInfoSchema.optional(),
  social_media: SocialMediaSchema.optional().default({}),
  source_urls: z.array(z.string().url()).optional().default([]),
  data_quality_score: z.number().min(0).max(1).optional().default(0.5),
  verification_status: z.enum(['pending', 'verified', 'rejected']).optional().default('pending'),
  cuisine_type: z.array(z.string()).optional().default([]),
  price_range: PriceRangeSchema,
  specialties: z.array(z.string()).optional().default([])
});

// Food truck update schema
export const UpdateFoodTruckSchema = CreateFoodTruckSchema.partial().extend({
  id: z.string().uuid('Invalid truck ID format').min(1, 'Truck ID is required')
});

// Data cleanup schemas
export const DataCleanupSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  options: z.object({
    batchSize: z.number().min(1).max(1000).optional().default(100),
    dryRun: z.boolean().optional().default(false),
    operations: z.array(z.string()).optional(),
    truckData: z.record(z.unknown()).optional(),
    targetId: z.string().optional(),
    sourceId: z.string().optional()
  }).optional().default({})
});

// Search query schema
export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  cuisine: z.string().optional(),
  openNow: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean()
  ).optional().default(false),
  lat: z.preprocess(
    (val) => typeof val === 'string' ? parseFloat(val) : val,
    z.number().min(-90).max(90)
  ).optional(),
  lng: z.preprocess(
    (val) => typeof val === 'string' ? parseFloat(val) : val,
    z.number().min(-180).max(180)
  ).optional(),
  radius: z.preprocess(
    (val) => typeof val === 'string' ? parseFloat(val) : val,
    z.number().min(0).max(50)
  ).optional().default(5)
});

// Generic request schemas
export const PostRequestSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  data: z.record(z.unknown()).optional()
});

export const PutRequestSchema = z.object({
  id: z.string().uuid('Invalid ID format').min(1, 'ID is required'),
  updates: z.record(z.unknown()).refine(obj => Object.keys(obj).length > 0, { message: 'Updates object cannot be empty' })
});

// Firecrawl request schema
export const FirecrawlRequestSchema = z.object({
  operation: z.enum(['scrape', 'crawl', 'search'], { errorMap: () => ({ message: 'Operation must be scrape, crawl, or search' }) }),
  url: z.string().url('Invalid URL format').optional(),
  query: z.string().optional(),
  options: z.record(z.unknown()).optional().default({})
}).refine(
  (data) => {
    // URL is required for scrape and crawl operations
    if ((data.operation === 'scrape' || data.operation === 'crawl') && !data.url) {
      return false;
    }
    return true;
  },
  {
    message: 'URL is required for scrape and crawl operations',
    path: ['url']
  }
);

// Tavily request schema
export const TavilyRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  searchDepth: z.enum(['basic', 'advanced']).optional().default('basic'),
  includeImages: z.boolean().optional().default(false),
  includeAnswer: z.boolean().optional().default(false),
  maxResults: z.number().min(1).max(20).optional().default(10)
});

// Analytics/Web Vitals schema
export const WebVitalsSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  value: z.number().min(0, 'Value must be non-negative'),
  label: z.string().optional(),
  url: z.string().url().optional(),
  userId: z.string().optional()
});

// Pipeline run schema
export const PipelineRunSchema = z.object({
  url: z.string().url('Invalid URL format'),
  testMode: z.boolean().optional().default(false),
  skipValidation: z.boolean().optional().default(false)
});

// Scraping job schema
export const ScrapingJobSchema = z.object({
  job_type: z.string().min(1, 'Job type is required'),
  target_url: z.string().url().optional(),
  target_handle: z.string().optional(),
  platform: z.string().optional(),
  priority: z.number().min(1).max(10).optional().default(5),
  scheduled_at: z.string().datetime().optional().default(() => new Date().toISOString()),
  max_retries: z.number().min(0).max(10).optional().default(3)
});

// Common ID parameter validation
export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

// Pagination schema for query parameters
export const PaginationSchema = z.object({
  limit: z.preprocess(
    (val) => typeof val === 'string' ? parseInt(val, 10) : val,
    z.number().min(1).max(100).optional().default(50)
  ),
  offset: z.preprocess(
    (val) => typeof val === 'string' ? parseInt(val, 10) : val,
    z.number().min(0).optional().default(0)
  )
});

// Location-based query schema
export const LocationQuerySchema = z.object({
  lat: z.preprocess(
    (val) => typeof val === 'string' ? parseFloat(val) : val,
    z.number().min(-90).max(90).optional()
  ),
  lng: z.preprocess(
    (val) => typeof val === 'string' ? parseFloat(val) : val,
    z.number().min(-180).max(180).optional()
  ),
  radius: z.preprocess(
    (val) => typeof val === 'string' ? parseFloat(val) : val,
    z.number().min(0).max(50).optional().default(5)
  )
});

// Export JSON Schema versions for Supabase validation
export const APISchemasJSON = {
  MenuItem: toJSON(MenuItemSchema, 'MenuItem'),
  MenuCategory: toJSON(MenuCategorySchema, 'MenuCategory'),
  CurrentLocation: toJSON(CurrentLocationSchema, 'CurrentLocation'),
  ScheduledLocation: toJSON(ScheduledLocationSchema, 'ScheduledLocation'),
  CreateFoodTruck: toJSON(CreateFoodTruckSchema, 'CreateFoodTruck'),
  UpdateFoodTruck: toJSON(UpdateFoodTruckSchema, 'UpdateFoodTruck'),
  DataCleanup: toJSON(DataCleanupSchema, 'DataCleanup'),
  SearchQuery: toJSON(SearchQuerySchema, 'SearchQuery'),
  PostRequest: toJSON(PostRequestSchema, 'PostRequest'),
  PutRequest: toJSON(PutRequestSchema, 'PutRequest'),
  FirecrawlRequest: toJSON(FirecrawlRequestSchema, 'FirecrawlRequest'),
  TavilyRequest: toJSON(TavilyRequestSchema, 'TavilyRequest'),
  WebVitals: toJSON(WebVitalsSchema, 'WebVitals'),
  PipelineRun: toJSON(PipelineRunSchema, 'PipelineRun'),
  ScrapingJob: toJSON(ScrapingJobSchema, 'ScrapingJob'),
  IdParam: toJSON(IdParamSchema, 'IdParam'),
  Pagination: toJSON(PaginationSchema, 'Pagination'),
  LocationQuery: toJSON(LocationQuerySchema, 'LocationQuery')
};

// Registry of schema names to schemas for dynamic lookup
export const SchemaRegistry = {
  MenuItem: MenuItemSchema,
  MenuCategory: MenuCategorySchema,
  CurrentLocation: CurrentLocationSchema,
  ScheduledLocation: ScheduledLocationSchema,
  CreateFoodTruck: CreateFoodTruckSchema,
  UpdateFoodTruck: UpdateFoodTruckSchema,
  DataCleanup: DataCleanupSchema,
  SearchQuery: SearchQuerySchema,
  PostRequest: PostRequestSchema,
  PutRequest: PutRequestSchema,
  FirecrawlRequest: FirecrawlRequestSchema,
  TavilyRequest: TavilyRequestSchema,
  WebVitals: WebVitalsSchema,
  PipelineRun: PipelineRunSchema,
  ScrapingJob: ScrapingJobSchema,
  IdParam: IdParamSchema,
  Pagination: PaginationSchema,
  LocationQuery: LocationQuerySchema
} as const;

// Type helper for schema names
export type SchemaName = keyof typeof SchemaRegistry;
