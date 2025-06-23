import {
  createClient,
  type PostgrestSingleResponse,
  type PostgrestResponse,
} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl == null || supabaseUrl === '') {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (supabaseAnonKey == null || supabaseAnonKey === '') {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Only create admin client on server side where service key is available
export const supabaseAdmin = (supabaseServiceKey != null && supabaseServiceKey !== '')
  ? createClient(supabaseUrl, supabaseServiceKey)
  : undefined;

// Database types
import {
  MenuCategory,
  MenuItem,
  OperatingHours,
  PriceRange,
  ExtractedFoodTruckDetails,
} from './types';

export interface FoodTruckLocation {
  lat?: number;
  lng?: number;
  address?: string;
  timestamp: string;
}

// Re-exporting from types.ts to ensure consistency

export interface FoodTruck {
  id: string;
  name: string;
  description?: string;
  current_location: FoodTruckLocation;
  scheduled_locations?: ExtractedFoodTruckDetails['scheduled_locations']; // Use type from types.ts
  operating_hours?: OperatingHours; // Use type from types.ts
  menu?: MenuCategory[]; // Use type from types.ts
  contact_info?: ExtractedFoodTruckDetails['contact_info']; // Use type from types.ts
  social_media?: ExtractedFoodTruckDetails['social_media']; // Use type from types.ts
  cuisine_type?: string[];
  price_range?: PriceRange; // Use type from types.ts
  specialties?: string[];
  data_quality_score?: number;
  verification_status: 'pending' | 'verified' | 'flagged' | 'rejected';
  source_urls?: string[];
  created_at: string;
  updated_at: string;
  last_scraped_at?: string;
  exact_location?: FoodTruckLocation;
  city_location?: FoodTruckLocation;
  average_rating?: number; // Added for ratings
  review_count?: number; // Added for ratings
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

// Food truck operations
function buildMenuByTruck(menuItems: RawMenuItemFromDB[]): Record<string, RawMenuItemFromDB[]> {
  const menuByTruck: Record<string, RawMenuItemFromDB[]> = {};
  for (const item of menuItems) {
    if (!menuByTruck[item.food_truck_id as string]) {
      menuByTruck[item.food_truck_id as string] = [];
    }
    menuByTruck[item.food_truck_id as string].push(item);
  }
  return menuByTruck;
}

function handleSupabaseError(error: unknown, context: string) {
  console.warn(`Error in ${context}:`, error);
}

export const FoodTruckService = {
  async getAllTrucks(limit = 50, offset = 0): Promise<{ trucks: FoodTruck[]; total: number }> {
    try {
      const { data, error, count }: PostgrestResponse<FoodTruck> = await supabase
        .from('food_trucks')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      const trucks: FoodTruck[] = (data ?? []).map((t: FoodTruck) => normalizeTruckLocation(t));
      if (trucks.length === 0) return { trucks: [], total: count ?? 0 };
      const truckIds = trucks.map((t) => t.id);
      let menuItems: RawMenuItemFromDB[] = [];
      try {
        if (truckIds.length > 0) {
          const { data: items, error: menuError }: PostgrestResponse<RawMenuItemFromDB> =
            await supabase.from('menu_items').select('*').in('food_truck_id', truckIds);
          if (menuError) throw menuError;
          menuItems = Array.isArray(items) ? items : [];
        }
      } catch (menuError) {
        handleSupabaseError(menuError, 'getAllTrucks:menu_items');
      }
      const menuByTruck = buildMenuByTruck(menuItems);
      for (const truck of trucks) {
        truck.menu = groupMenuItems(menuByTruck[truck.id] ?? []);
      }
      return { trucks, total: count ?? 0 };
    } catch (error) {
      handleSupabaseError(error, 'getAllTrucks');
      return { trucks: [], total: 0 };
    }
  },
  async getTruckById(id: string): Promise<FoodTruck> {
    const { data, error }: PostgrestSingleResponse<FoodTruck> = await supabase
      .from('food_trucks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    const truck: FoodTruck = normalizeTruckLocation(data);
    const { data: items, error: menuError }: PostgrestResponse<RawMenuItemFromDB> = await supabase
      .from('menu_items')
      .select('*')
      .eq('food_truck_id', id);
    if (menuError) throw menuError;
    truck.menu = groupMenuItems(Array.isArray(items) ? items : []);
    return truck;
  },

  async getTrucksByLocation(lat: number, lng: number, radiusKm: number): Promise<FoodTruck[]> {
    try {
      const { trucks } = await FoodTruckService.getAllTrucks();
      const nearbyTrucks = trucks.filter((truck) => {
        if (
          truck.current_location == undefined ||
          typeof truck.current_location.lat !== 'number' ||
          typeof truck.current_location.lng !== 'number'
        ) {
          return false;
        }
        const distance = calculateDistance(
          lat,
          lng,
          truck.current_location.lat,
          truck.current_location.lng,
        );
        return distance <= radiusKm;
      });
      return nearbyTrucks;
    } catch (error: unknown) {
      console.warn('Error fetching trucks by location:', error);
      return [];
    }
  },
  async createTruck(truckData: Partial<FoodTruck>): Promise<FoodTruck> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }
    const menuData = truckData.menu;
    const truckDataWithoutMenu = { ...truckData };
    delete truckDataWithoutMenu.menu;
    const { data: truck, error }: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
      .from('food_trucks')
      .insert([truckDataWithoutMenu])
      .select()
      .single();
    if (error) throw error;
    await insertMenuItems(truck.id, menuData);
    return truck;
  },

  async updateTruck(id: string, updates: Partial<FoodTruck>): Promise<FoodTruck> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }
    const menuData = updates.menu;
    const updatesWithoutMenu = { ...updates };
    delete updatesWithoutMenu.menu;
    const truck = await updateTruckData(id, updatesWithoutMenu);
    if (menuData != null) {
      await updateTruckMenu(id, menuData);
    }
    return truck;
  },

  async getDataQualityStats(): Promise<{
    total_trucks: number;
    avg_quality_score: number;
    high_quality_count: number;
    medium_quality_count: number;
    low_quality_count: number;
    verified_count: number;
    pending_count: number;
    flagged_count: number;
  }> {
    try {
      const {
        data,
        error,
      }: PostgrestSingleResponse<{
        total_trucks: number;
        avg_quality_score: number;
        high_quality_count: number;
        medium_quality_count: number;
        low_quality_count: number;
        verified_count: number;
        pending_count: number;
        flagged_count: number;
      }> = await supabase.rpc('get_data_quality_stats').single();
      if (error) throw error;
      return data as {
        total_trucks: number;
        avg_quality_score: number;
        high_quality_count: number;
        medium_quality_count: number;
        low_quality_count: number;
        verified_count: number;
        pending_count: number;
        flagged_count: number;
      };
    } catch (error: unknown) {
      console.warn('Error fetching data quality stats:', error);
      return {
        total_trucks: 0,
        avg_quality_score: 0,
        high_quality_count: 0,
        medium_quality_count: 0,
        low_quality_count: 0,
        verified_count: 0,
        pending_count: 0,
        flagged_count: 0,
      };
    }
  },
};

// Helper functions to reduce cognitive complexity
async function updateTruckData(
  id: string,
  updatesWithoutMenu: Partial<FoodTruck>,
): Promise<FoodTruck> {
  if (!supabaseAdmin) {
    throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
  }

  const { data: truck, error }: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
    .from('food_trucks')
    .update(updatesWithoutMenu)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return truck;
}

async function updateTruckMenu(id: string, menuData: MenuCategory[]): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
  }

  // Delete existing menu items
  const { error: deleteError } = await supabaseAdmin
    .from('menu_items')
    .delete()
    .eq('food_truck_id', id);

  if (deleteError) {
    console.error('Error deleting existing menu items for truck', id, deleteError);
  }

  // Insert new menu items if they exist
  if (menuData != undefined && menuData.length > 0) {
    const menuItems = menuData.flatMap((category) =>
      (category.items ?? []).map((item) => ({
        food_truck_id: id,
        category: category.name ?? 'Uncategorized',
        name: item.name ?? 'Unknown Item',
        description: item.description ?? undefined,
        price: typeof item.price === 'number' ? item.price : undefined,
        dietary_tags: item.dietary_tags ?? [],
      })),
    );

    if (menuItems.length > 0) {
      const { error: menuError } = await supabaseAdmin.from('menu_items').insert(menuItems);

      if (menuError) {
        console.error('Error inserting updated menu items for truck', id, menuError);
      }
    }
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Define a helper type for items coming from the DB, which might include a category field
interface RawMenuItemFromDB {
  name: string;
  description?: string;
  price?: number;
  dietary_tags?: string[];
  category?: string; // This field is expected from the DB query
  // Potentially other fields like id, food_truck_id, etc.
  [key: string]: unknown; // Allow other properties from DB select *
}

function groupMenuItems(rawItems: RawMenuItemFromDB[]): MenuCategory[] {
  const byCategory: Record<string, MenuItem[]> = {}; // Stores processed MenuItems
  for (const rawItem of rawItems) {
    const categoryName: string = rawItem.category ?? 'Uncategorized';
    byCategory[categoryName] ??= [];
    // Construct a MenuItem conforming to the MenuItem interface (no 'category' property)
    const menuItem: MenuItem = {
      name: rawItem.name,
      // Use nullish coalescing to convert null from DB to undefined for the MenuItem type
      description: rawItem.description ?? undefined,
      price: rawItem.price ?? undefined,
      dietary_tags: rawItem.dietary_tags ?? [], // Default to empty array if null/undefined
    };
    byCategory[categoryName].push(menuItem);
  }
  // Map to MenuCategory structure { name: string, items: MenuItem[] }
  return Object.entries(byCategory).map(([categoryName, itemsList]) => ({
    name: categoryName, // 'name' here refers to the category's name
    items: itemsList,
  }));
}

// Remove redundant type constituent in normalizeTruckLocation
function normalizeTruckLocation(truck: FoodTruck): FoodTruck {
  const fallback: FoodTruckLocation = {
    lat: undefined,
    lng: undefined,
    address: 'Unknown',
    timestamp: new Date().toISOString(),
  };
  const loc = truck.exact_location ?? truck.current_location ?? truck.city_location ?? {};
  const lat = typeof loc.lat === 'number' ? loc.lat : undefined;
  const lng = typeof loc.lng === 'number' ? loc.lng : undefined;
  const address = loc.address;
  const timestamp = loc.timestamp;

  truck.current_location =
    lat == null || lng == null || (lat === 0 && lng === 0)
      ? { ...fallback, address: address ?? fallback.address }
      : {
          lat,
          lng,
          address: address ?? fallback.address,
          timestamp: timestamp ?? fallback.timestamp,
        };
  return truck;
}

export const ScrapingJobService = {
  async createJob(jobData: Partial<ScrapingJob>): Promise<ScrapingJob> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
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

    if (error) throw error;
    return data;
  },

  async getJobsByStatus(status: string): Promise<ScrapingJob[]> {
    try {
      const query =
        status === 'all'
          ? supabase.from('scraping_jobs').select('*')
          : supabase.from('scraping_jobs').select('*').eq('status', status);

      const { data, error }: PostgrestResponse<ScrapingJob> = await query
        .order('priority', { ascending: false })
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching jobs:', error);
      return [];
    }
  },
  async updateJobStatus(
    id: string,
    status: string,
    updates: Partial<ScrapingJob> = {},
  ): Promise<ScrapingJob> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
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
    if (error) throw error;
    return data;
  },
  async incrementRetryCount(id: string): Promise<ScrapingJob> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const {
      data: current,
      error: fetchError,
    }: PostgrestSingleResponse<Pick<ScrapingJob, 'retry_count'>> = await supabaseAdmin
      .from('scraping_jobs')
      .select('retry_count')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error }: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
      .from('scraping_jobs')
      .update({ retry_count: (current?.retry_count ?? 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  async getAllJobs(limit = 50, offset = 0): Promise<ScrapingJob[]> {
    try {
      const { data, error }: PostgrestResponse<ScrapingJob> = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching all jobs:', error);
      return [];
    }
  },

  async getJobsFromDate(date: Date): Promise<ScrapingJob[]> {
    try {
      const { data, error }: PostgrestResponse<ScrapingJob> = await supabase
        .from('scraping_jobs')
        .select('*')
        .gte('created_at', date.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching jobs from date:', error);
      return [];
    }
  },
};

export const DataProcessingService = {
  async addToQueue(queueData: Partial<DataProcessingQueue>): Promise<DataProcessingQueue> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
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

    if (error) throw error;
    return data;
  },

  async getNextQueueItem(): Promise<DataProcessingQueue | undefined> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
      .from('data_processing_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ?? undefined;
  },

  async getQueueByStatus(status: string): Promise<DataProcessingQueue[]> {
    try {
      const { data, error }: PostgrestResponse<DataProcessingQueue> = await supabase
        .from('data_processing_queue')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching queue:', error);
      return [];
    }
  },
  async updateQueueItem(
    id: string,
    updates: Partial<DataProcessingQueue>,
  ): Promise<DataProcessingQueue> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
      .from('data_processing_queue')
      .update({
        ...updates,
        ...(updates.status === 'completed' && { processed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const DataQualityService = {
  calculateQualityScore: (truck: FoodTruck) => {
    // Placeholder for actual quality score calculation logic
    // This should be implemented based on defined data quality rules
    let score = 0;
    if (typeof truck.name === 'string' && truck.name.trim() !== '') score += 20;
    if (
      truck.current_location &&
      typeof truck.current_location.lat === 'number' && !Number.isNaN(truck.current_location.lat) &&
      typeof truck.current_location.lng === 'number' && !Number.isNaN(truck.current_location.lng)
    ) score += 30;
    if (
      (truck.contact_info &&
        ((typeof truck.contact_info.phone === 'string' && truck.contact_info.phone.trim() !== '') ||
         (typeof truck.contact_info.email === 'string' && truck.contact_info.email.trim() !== '') ||
         (typeof truck.contact_info.website === 'string' && truck.contact_info.website.trim() !== '')))
    ) score += 25;
    if (Array.isArray(truck.menu) && truck.menu.length > 0) score += 15;
    if (truck.operating_hours != null && truck.operating_hours != null) score += 10;
    return { score: Math.min(100, score) };
  },

  async updateTruckQualityScore(truckId: string): Promise<FoodTruck> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }
    const { data: truck, error: fetchError } = await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .eq('id', truckId)
      .single();

    if (fetchError) throw fetchError;
    if (!truck) throw new Error(`Truck with ID ${truckId} not found.`);

    const { score } = this.calculateQualityScore(truck);

    const { data, error } = await supabaseAdmin
      .from('food_trucks')
      .update({ data_quality_score: score })
      .eq('id', truckId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const APIUsageService = {
  async trackUsage(serviceName: string, requests: number, tokens: number): Promise<ApiUsage> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: existing }: PostgrestSingleResponse<ApiUsage> = await supabaseAdmin
        .from('api_usage')
        .select('*')
        .eq('service_name', serviceName)
        .eq('usage_date', today)
        .single();
      if (existing) {
        const { data, error }: PostgrestSingleResponse<ApiUsage> = await supabaseAdmin
          .from('api_usage')
          .update({
            requests_count: (existing.requests_count ?? 0) + requests,
            tokens_used: (existing.tokens_used ?? 0) + tokens,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error }: PostgrestSingleResponse<ApiUsage> = await supabaseAdmin
          .from('api_usage')
          .insert([
            {
              service_name: serviceName,
              usage_date: today,
              requests_count: requests,
              tokens_used: tokens,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error: unknown) {
      console.warn('Error tracking usage:', error);
      throw error;
    }
  },
  async getTodayUsage(serviceName: string): Promise<ApiUsage | undefined> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error }: PostgrestSingleResponse<ApiUsage> = await supabase
        .from('api_usage')
        .select('*')
        .eq('service_name', serviceName)
        .eq('usage_date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ?? undefined;
    } catch (error: unknown) {
      console.warn('Error getting today usage:', error);
      throw error;
    }
  },

  async getAllUsageStats(): Promise<ApiUsage[]> {
    try {
      const { data, error }: PostgrestResponse<ApiUsage> = await supabase
        .from('api_usage')
        .select('*')
        .order('usage_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error getting usage stats:', error);
      throw error;
    }
  },
};

export { type MenuItem, type MenuCategory, type OperatingHours, type PriceRange } from './types';

// Helper to prepare menu items for DB insertion
function prepareMenuItemsForInsert(truckId: string, menuData: MenuCategory[] | undefined) {
  if (!menuData || menuData.length === 0) return [];
  return menuData.flatMap((category) =>
    (category.items ?? []).map((item) => ({
      food_truck_id: truckId,
      category: category.name ?? 'Uncategorized',
      name: item.name ?? 'Unknown Item',
      description: item.description ?? undefined,
      price: typeof item.price === 'number' ? item.price : undefined,
      dietary_tags: item.dietary_tags ?? [],
    }))
  );
}

async function insertMenuItems(truckId: string, menuData: MenuCategory[] | undefined) {
  const menuItems = prepareMenuItemsForInsert(truckId, menuData);
  if (menuItems.length === 0) return;
  const { error: menuError } = await supabaseAdmin!.from('menu_items').insert(menuItems);
  if (menuError) {
    console.error('Error inserting menu items for truck', truckId, menuError);
  }
}

// Fix all strict-boolean-expressions and always-true/false comparisons below
// Example: if (someString) => if (typeof someString === 'string' && someString.trim() !== '')
// Example: if (someNumber) => if (typeof someNumber === 'number' && !Number.isNaN(someNumber) && someNumber !== 0)
// Example: if (someObject) => if (someObject != null && someObject != null)

// For all other conditionals, ensure explicit nullish/empty/NaN checks as above
