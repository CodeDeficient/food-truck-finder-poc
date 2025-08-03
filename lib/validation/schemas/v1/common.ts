import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Common validation schemas used across multiple entities
// Version: v1.0.0

// Utility function to convert Zod schema to JSON Schema
export function toJSON<T>(schema: z.ZodSchema<T>, title?: string) {
  return zodToJsonSchema(schema, {
    name: title,
    $refStrategy: 'none'
  });
}

// Base validation patterns
export const EmailSchema = z.string().email('Invalid email format');

export const PhoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,14}$/, 'Invalid phone number format')
  .optional();

export const UrlSchema = z.string().url('Invalid URL format').optional();

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180')
});

export const UserCoordinatesSchema = CoordinatesSchema;

// Price range validation
export const PriceRangeSchema = z.enum(['$', '$$', '$$$', '$$$$'], {
  errorMap: () => ({ message: 'Price range must be $, $$, $$$, or $$$$' })
}).optional();

// Contact information schema
export const ContactInfoSchema = z.object({
  phone: PhoneSchema,
  email: EmailSchema.optional(),
  website: UrlSchema
});

// Social media schema
export const SocialMediaSchema = z.object({
  facebook: UrlSchema,
  instagram: UrlSchema,
  twitter: UrlSchema,
  tiktok: UrlSchema,
  yelp: UrlSchema
});

// Location data schema
export const LocationDataSchema = z.object({
  address: z.string().min(1, 'Address is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().length(2, 'State must be 2 characters').optional(),
  landmarks: z.array(z.string()).default([]),
  coordinates: CoordinatesSchema,
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
  raw_location_text: z.string().optional()
});

// Daily operating hours schema
export const DailyOperatingHoursSchema = z.union([
  z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    closed: z.literal(false).optional()
  }),
  z.object({
    closed: z.literal(true)
  }),
  z.undefined()
]);

// Operating hours schema
export const OperatingHoursSchema = z.object({
  monday: DailyOperatingHoursSchema,
  tuesday: DailyOperatingHoursSchema,
  wednesday: DailyOperatingHoursSchema,
  thursday: DailyOperatingHoursSchema,
  friday: DailyOperatingHoursSchema,
  saturday: DailyOperatingHoursSchema,
  sunday: DailyOperatingHoursSchema
}).catchall(DailyOperatingHoursSchema); // For index signature support

// Export JSON Schema versions
export const CommonSchemasJSON = {
  Email: toJSON(EmailSchema, 'Email'),
  Phone: toJSON(PhoneSchema, 'Phone'),
  Url: toJSON(UrlSchema, 'URL'),
  Coordinates: toJSON(CoordinatesSchema, 'Coordinates'),
  UserCoordinates: toJSON(UserCoordinatesSchema, 'UserCoordinates'),
  PriceRange: toJSON(PriceRangeSchema, 'PriceRange'),
  ContactInfo: toJSON(ContactInfoSchema, 'ContactInfo'),
  SocialMedia: toJSON(SocialMediaSchema, 'SocialMedia'),
  LocationData: toJSON(LocationDataSchema, 'LocationData'),
  DailyOperatingHours: toJSON(DailyOperatingHoursSchema, 'DailyOperatingHours'),
  OperatingHours: toJSON(OperatingHoursSchema, 'OperatingHours')
};
