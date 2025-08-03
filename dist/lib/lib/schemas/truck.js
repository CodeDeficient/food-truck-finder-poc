import { z } from 'zod';
// PriceRange Schema
export const PriceRangeSchema = z.union([
    z.literal('$'),
    z.literal('$$'),
    z.literal('$$$'),
]);
// Coordinates Schema
export const CoordinatesSchema = z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
});
// LocationData Schema
export const LocationDataSchema = z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    landmarks: z.array(z.string()),
    coordinates: CoordinatesSchema,
    confidence: z.number(),
    raw_location_text: z.string().optional(),
});
// DailyOperatingHours Schema
export const DailyOperatingHoursSchema = z.union([
    z.object({
        open: z.string(),
        close: z.string(),
        closed: z.literal(false),
    }),
    z.object({
        closed: z.literal(true),
    }),
    z.undefined(),
]);
// OperatingHours Schema
export const OperatingHoursSchema = z.object({
    monday: DailyOperatingHoursSchema,
    tuesday: DailyOperatingHoursSchema,
    wednesday: DailyOperatingHoursSchema,
    thursday: DailyOperatingHoursSchema,
    friday: DailyOperatingHoursSchema,
    saturday: DailyOperatingHoursSchema,
    sunday: DailyOperatingHoursSchema,
}).catchall(DailyOperatingHoursSchema); // For the index signature [key: string]: DailyOperatingHours;
// MenuItem Schema
export const MenuItemSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.union([z.number(), z.string()]).optional(),
    dietary_tags: z.array(z.any()), // 'any[]' in interface, so 'z.any()' for now
    is_popular: z.boolean().optional(),
});
// MenuCategory Schema
export const MenuCategorySchema = z.object({
    name: z.string(),
    items: z.array(MenuItemSchema),
});
// ContactInfo Schema (from ExtractedFoodTruckDetails)
export const ContactInfoSchema = z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
});
// SocialMedia Schema (from ExtractedFoodTruckDetails)
export const SocialMediaSchema = z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
    yelp: z.string().optional(),
});
// ScheduledLocation Schema (from ExtractedFoodTruckDetails)
export const ScheduledLocationSchema = z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    timestamp: z.string(),
    start_time: z.string(),
    end_time: z.string(),
});
// FoodTruckSchema
export const FoodTruckSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    current_location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional(),
        timestamp: z.string(),
    }),
    scheduled_locations: z.array(ScheduledLocationSchema).optional(),
    operating_hours: OperatingHoursSchema,
    menu: z.array(MenuCategorySchema),
    contact_info: ContactInfoSchema,
    social_media: SocialMediaSchema,
    cuisine_type: z.array(z.string()),
    price_range: PriceRangeSchema.optional(),
    specialties: z.array(z.string()),
    data_quality_score: z.number(),
    verification_status: z.union([
        z.literal('pending'),
        z.literal('verified'),
        z.literal('flagged'),
    ]),
    source_urls: z.array(z.string()),
    last_scraped_at: z.string(),
    test_run_flag: z.boolean().optional(),
    website: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().optional(),
    instagram_handle: z.string().optional(),
    facebook_handle: z.string().optional(),
    twitter_handle: z.string().optional(),
    schedule: z.array(z.any()).optional(), // 'unknown[]' in interface, so 'z.any()' for now
    average_rating: z.number().optional(),
    review_count: z.number().optional(),
});
// Truck Schema (extends FoodTruckSchema)
export const TruckSchema = FoodTruckSchema.extend({
    id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    is_active: z.boolean().optional(),
});
