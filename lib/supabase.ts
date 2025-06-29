import {
  createClient,
  type PostgrestSingleResponse,
  type PostgrestResponse,
  type PostgrestError,
} from '@supabase/supabase-js';



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Only create admin client on server side where service key is available
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : undefined;

// Database types
import {
  MenuCategory,
  MenuItem,
} from './types';

export interface FoodTruckLocation {
  lat: number;
  lng: number;
  address?: string;
  timestamp: string;
}

// Re-exporting from types.ts to ensure consistency

import { FoodTruckSchema } from './types';

export interface FoodTruck extends FoodTruckSchema {
  id: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean; // This property is in lib/types.ts but not in lib/supabase.ts
  // Add any other properties that are in the database but not in FoodTruckSchema
  // For example, if the database has 'exact_location' or 'city_location'
  exact_location?: FoodTruckLocation;
  city_location?: FoodTruckLocation;
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
    // Ensure food_truck_id is a non-empty string before using it as a key
    if (typeof item.food_truck_id === 'string' && item.food_truck_id.trim() !== '') {
      if (!menuByTruck[item.food_truck_id]) {
        menuByTruck[item.food_truck_id] = [];
      }
      menuByTruck[item.food_truck_id].push(item);
    }
  }
  return menuByTruck;
}

function handleSupabaseError(error: unknown, context: string) {
  // Log technical details for developers
  console.warn(`Error in ${context}:`, error);
}

export const FoodTruckService = {
  async getAllTrucks(limit = 50, offset = 0): Promise<{ trucks: FoodTruck[]; total: number; error?: string }> {
    try {
      const { data, error, count }: PostgrestResponse<FoodTruck> = await supabase
        .from('food_trucks')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) {
        throw error;
      }
      const trucks: FoodTruck[] = (data ?? []).map((t) => normalizeTruckLocation(t));
      if (trucks.length === 0) {
        return { trucks: [], total: count ?? 0 };
      }
      const truckIds = trucks.map((t) => t.id);
      let menuItems: RawMenuItemFromDB[] = [];
      try {
        if (truckIds.length > 0) {
          const { data: items, error: menuError }: PostgrestResponse<RawMenuItemFromDB> =
            await supabase.from('menu_items').select('*').in('food_truck_id', truckIds);
          if (menuError) {
            throw menuError;
          }
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
      return { trucks: [], total: 0, error: "That didn't work, please try again later." };
    }
  },
  async getTruckById(id: string): Promise<FoodTruck | { error: string }> {
    try {
      const { data, error }: PostgrestSingleResponse<FoodTruck> = await supabase
        .from('food_trucks')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        throw error;
      }
      const truck: FoodTruck = normalizeTruckLocation(data);
      const { data: items, error: menuError }: PostgrestResponse<RawMenuItemFromDB> = await supabase
        .from('menu_items')
        .select('*')
        .eq('food_truck_id', id);
      if (menuError) {
        throw menuError;
      }
      truck.menu = groupMenuItems(Array.isArray(items) ? items : []);
      return truck;
    } catch (error) {
      handleSupabaseError(error, 'getTruckById');
      return { error: "That didn't work, please try again later." };
    }
  },

  async getTrucksByLocation(lat: number, lng: number, radiusKm: number): Promise<FoodTruck[] | { error: string }> {
    try {
      const { trucks } = await FoodTruckService.getAllTrucks(); // Assuming this doesn't return an error object directly for this usage
      const nearbyTrucks = trucks.filter((truck) => {
        if (
          !truck.current_location || // Check if current_location is null or undefined
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
      handleSupabaseError(error, 'getTrucksByLocation');
      return { error: "That didn't work, please try again later." };
    }
  },
  async createTruck(truckData: Partial<FoodTruck>): Promise<FoodTruck | { error: string }> {
    if (!supabaseAdmin) {
      return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
    }
    const menuData = truckData.menu;
    const truckDataWithoutMenu = { ...truckData };
    delete truckDataWithoutMenu.menu;
    const { data: truck, error }: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
      .from('food_trucks')
      .insert([truckDataWithoutMenu])
      .select()
      .single();
    if (error) {
      handleSupabaseError(error, 'createTruck');
      return { error: "Failed to create truck." };
    }
    if (truck) { // Ensure truck is not null
      await insertMenuItems(truck.id, menuData);
      return truck;
    }
    // Should not happen if error is not thrown, but as a safeguard
    return { error: "Failed to create truck, unexpected null result."};
  },

  async updateTruck(id: string, updates: Partial<FoodTruck>): Promise<FoodTruck | { error: string }> {
    if (!supabaseAdmin) {
      return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
    }
    const menuData = updates.menu;
    const updatesWithoutMenu = { ...updates };
    delete updatesWithoutMenu.menu;
    const truckResult = await updateTruckData(id, updatesWithoutMenu);
    if ('error' in truckResult) {
      return truckResult;
    }
    if (menuData !== undefined && menuData !== null) { // Check for null as well
      await updateTruckMenu(id, menuData);
    }
    return truckResult;
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
      if (error) {
        throw error;
      }
      if (!data) { // Handle null data case
        console.warn('No data returned from get_data_quality_stats');
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
      return data as { // This cast might still be necessary depending on Supabase's RPC typing
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
): Promise<FoodTruck | { error: string }> {
  if (!supabaseAdmin) {
    return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
  }

  const { data: truck, error }: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
    .from('food_trucks')
    .update(updatesWithoutMenu)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'updateTruckData');
    return { error: "Failed to update truck data." };
  }
    if (!truck) { // Handle null truck case
        return { error: "Failed to update truck data, truck not found after update." };
    }
  return truck;
}

async function updateTruckMenu(id: string, menuData: MenuCategory[] | unknown[]): Promise<void> {
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
    // Depending on desired behavior, you might want to throw or return an error here
  }

  // Insert new menu items if they exist and menuData is an array and has items
  if (Array.isArray(menuData) && menuData.length > 0) {
    const menuItems = menuData.flatMap((category: unknown) => {
      // Type guard for MenuCategory
      const isMenuCategory = (obj: unknown): obj is MenuCategory =>
        typeof obj === 'object' && obj !== null && 'name' in obj && 'items' in obj && Array.isArray(obj.items);

      if (!isMenuCategory(category)) {
        console.warn('Skipping invalid category in updateTruckMenu:', category);
        return [];
      }

      return (category.items ?? []).map((item: unknown) => {
        // Type guard for MenuItem
        const isMenuItem = (obj: unknown): obj is MenuItem =>
          typeof obj === 'object' && obj !== null && 'name' in obj;

        if (!isMenuItem(item)) {
          console.warn('Skipping invalid menu item in updateTruckMenu:', item);
          // Return a default valid MenuItem or skip based on requirements
          return {
            food_truck_id: id,
            category: category.name ?? 'Uncategorized', // Ensure category.name is a string
            name: 'Unknown Item',
            description: undefined,
            price: undefined,
            dietary_tags: [],
          };
        }

        return {
          food_truck_id: id,
          category: typeof category.name === 'string' ? category.name : 'Uncategorized',
          name: typeof item.name === 'string' ? item.name : 'Unknown Item',
          description: item.description ?? undefined,
          price: typeof item.price === 'number' ? item.price : undefined,
          dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags : [],
        };
      });
    });

    if (menuItems.length > 0) {
      const { error: menuError } = await supabaseAdmin.from('menu_items').insert(menuItems);

      if (menuError) {
        console.error('Error inserting updated menu items for truck', id, menuError);
        // Depending on desired behavior, you might want to throw or return an error here
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
      dietary_tags: rawItem.dietary_tags as string[] ?? [], // Explicitly cast to string[]
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
    lat: 0,
    lng: 0,
    address: 'Unknown',
    timestamp: new Date().toISOString(),
  };
  // Ensure loc is an object, provide a default empty object if not
  const loc = truck.exact_location ?? truck.current_location ?? truck.city_location ?? {};

  // Validate lat and lng, ensuring they are numbers and not NaN
  const lat = typeof loc.lat === 'number' && !Number.isNaN(loc.lat) ? loc.lat : 0;
  const lng = typeof loc.lng === 'number' && !Number.isNaN(loc.lng) ? loc.lng : 0;

  // Validate address and timestamp, ensuring they are strings
  const address = typeof loc.address === 'string' ? loc.address : fallback.address;
  const timestamp = typeof loc.timestamp === 'string' ? loc.timestamp : fallback.timestamp;

  // Assign current_location, using fallback if lat or lng is 0 (or invalid)
  truck.current_location =
    lat === 0 || lng === 0
      ? { ...fallback, address } // Use validated or fallback address
      : {
          lat,
          lng,
          address, // Use validated or fallback address
          timestamp, // Use validated or fallback timestamp
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

    if (error) {
        throw error;
    }
    if (!data) { // Handle null data case for createJob
        throw new Error("Failed to create job, no data returned.");
    }
    return data;
  },

  async getJobsByStatus(status: string): Promise<ScrapingJob[]> {
    try {
      const query = supabase.from('scraping_jobs').select('*');

      const { data, error }: PostgrestResponse<ScrapingJob> = await (status === 'all'
        ? query
        : query.eq('status', status))
        .order('priority', { ascending: false })
        .order('scheduled_at', { ascending: true });

      if (error) {
        throw error;
      }
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
    if (error) {
        throw error;
    }
    if (!data) { // Handle null data case for updateJobStatus
        throw new Error(`Failed to update job status for ID ${id}, no data returned.`);
    }
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

    if (fetchError) {
        throw fetchError;
    }
    if (!current) { // Handle null current case for incrementRetryCount
        throw new Error(`Failed to fetch current job for ID ${id} to increment retry count.`);
    }

    const { data, error }: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
      .from('scraping_jobs')
      .update({ retry_count: (current.retry_count ?? 0) + 1 }) // current is now guaranteed non-null
      .eq('id', id)
      .select()
      .single();

    if (error) {
        throw error;
    }
    if (!data) { // Handle null data case for the update in incrementRetryCount
        throw new Error(`Failed to increment retry count for job ID ${id}, no data returned after update.`);
    }
    return data;
  },
  async getAllJobs(limit = 50, offset = 0): Promise<ScrapingJob[]> {
    try {
      const { data, error }: PostgrestResponse<ScrapingJob> = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('priority', { ascending: false })
        .order('scheduled_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching jobs:', error);
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

      if (error) {
        throw error;
      }
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

    if (error) {
        throw error;
    }
    if (!data) { // Handle null data case for addToQueue
        throw new Error("Failed to add to queue, no data returned.");
    }
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

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is acceptable
        throw error;
    }
    return data ?? undefined; // data can be null if no item is found, which is fine
  },

  async getQueueByStatus(status: string): Promise<DataProcessingQueue[]> {
    try {
      const { data, error }: PostgrestResponse<DataProcessingQueue> = await supabase
        .from('data_processing_queue')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
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

    if (error) {
        throw error;
    }
    if (!data) { // Handle null data case for updateQueueItem
        throw new Error(`Failed to update queue item for ID ${id}, no data returned.`);
    }
    return data;
  },
};

export const DataQualityService = {
  calculateQualityScore: (truck: FoodTruck) => {
    // Placeholder for actual quality score calculation logic
    // This should be implemented based on defined data quality rules
    let score = 0;
    // Ensure truck.name is a non-empty string
    if (typeof truck.name === 'string' && truck.name.trim() !== '') {
      score += 20;
    }
    // Ensure current_location and its properties are valid
    if (
      truck.current_location &&
      typeof truck.current_location.lat === 'number' && !Number.isNaN(truck.current_location.lat) && truck.current_location.lat !== 0 &&
      typeof truck.current_location.lng === 'number' && !Number.isNaN(truck.current_location.lng) && truck.current_location.lng !== 0
    ) {
      score += 30;
    }
    // Ensure contact_info and at least one contact method are valid
    if (
      truck.contact_info &&
        ((typeof truck.contact_info.phone === 'string' && truck.contact_info.phone.trim() !== '') ||
         (typeof truck.contact_info.email === 'string' && truck.contact_info.email.trim() !== '') ||
         (typeof truck.contact_info.website === 'string' && truck.contact_info.website.trim() !== ''))
    ) {
      score += 25;
    }
    // Ensure menu is a non-empty array
    if (Array.isArray(truck.menu) && truck.menu.length > 0) {
      score += 15;
    }
    // Ensure operating_hours is defined (not null or undefined)
    if (truck.operating_hours !== undefined && truck.operating_hours !== null) {
      score += 10;
    }
    return { score: Math.min(100, score) };
  },

  async updateTruckQualityScore(truckId: string): Promise<FoodTruck | { error: string }> {
    if (!supabaseAdmin) {
      return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
    }
    const { data: truck, error: fetchError } = await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .eq('id', truckId)
      .single();

    if (fetchError) {
      handleSupabaseError(fetchError, 'updateTruckQualityScore:fetch');
      return { error: `Failed to fetch truck with ID ${truckId}.` };
    }
    if (!truck) {
      return { error: `Truck with ID ${truckId} not found.` };
    }

    const { score } = this.calculateQualityScore(truck);

    const { data, error } = await supabaseAdmin
      .from('food_trucks')
      .update({ data_quality_score: score })
      .eq('id', truckId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'updateTruckQualityScore:update');
      return { error: `Failed to update quality score for truck with ID ${truckId}.` };
    }
    if (!data) { // Handle null data case for updateTruckQualityScore
        return { error: `Failed to update quality score for truck with ID ${truckId}, no data returned after update.`};
    }
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

      const { data: existing }: { data: ApiUsage | null; error: PostgrestError | null } = await supabaseAdmin
        .from('api_usage')
        .select('*')
        .eq('service_name', serviceName)
        .eq('usage_date', today)
        .single();
      if (existing) { // existing can be null if no record is found
        const { data, error }: PostgrestSingleResponse<ApiUsage> = await supabaseAdmin
          .from('api_usage')
          .update({
            requests_count: (existing.requests_count ?? 0) + requests, // Nullish coalescing for safety
            tokens_used: (existing.tokens_used ?? 0) + tokens, // Nullish coalescing for safety
          })
          .eq('id', existing.id) // existing.id should be valid if existing is not null
          .select()
          .single();

        if (error) {
            throw error;
        }
        if (!data) { // Handle null data from update
            throw new Error("Failed to update API usage, no data returned.");
        }
        return data;
      } else { // This block executes if existing is null
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

        if (error) {
            throw error;
        }
        if (!data) { // Handle null data from insert
            throw new Error("Failed to insert API usage, no data returned.");
        }
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

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is acceptable
        throw error;
      }
      return data ?? undefined; // data can be null if no item is found, which is fine
    } catch (error: unknown) {
      console.warn('Error getting today usage:', error);
      throw error; // Re-throw after logging, or handle more gracefully
    }
  },

  async getAllUsageStats(): Promise<ApiUsage[]> {
    try {
      const { data, error }: PostgrestResponse<ApiUsage> = await supabase
        .from('api_usage')
        .select('*')
        .order('usage_date', { ascending: false })
        .limit(30);

      if (error) {
        throw error;
      }
      return data ?? []; // data can be null if no items are found, return empty array
    } catch (error: unknown) {
      console.warn('Error getting usage stats:', error);
      throw error; // Re-throw after logging, or handle more gracefully
    }
  },
};

export { type MenuItem, type MenuCategory, type OperatingHours, type PriceRange } from './types';

// Helper to prepare menu items for DB insertion
function prepareMenuItemsForInsert(truckId: string, menuData: MenuCategory[] | unknown[] | undefined) {
  if (!Array.isArray(menuData) || menuData.length === 0) {
    return [];
  }
  // Explicitly filter for MenuCategory to ensure type safety
  const categories = menuData.filter((category): category is MenuCategory =>
    typeof category === 'object' && category !== null && 'name' in category && typeof category.name === 'string' &&
    'items' in category && Array.isArray(category.items)
  ); // Removed unnecessary 'as MenuCategory[]'

  return categories.flatMap((category) => // category.name is now guaranteed to be a string
    (Array.isArray(category.items) ? category.items : []).map((item: unknown) => {
      // Type guard for MenuItem
      const isMenuItem = (obj: unknown): obj is MenuItem =>
        typeof obj === 'object' && obj !== null && 'name' in obj && typeof obj.name === 'string';

      if (!isMenuItem(item)) {
        console.warn('Skipping invalid menu item:', item);
        return null; // Return null for invalid items to be filtered out later
      }
      // item.name is now guaranteed to be a string
      return {
        food_truck_id: truckId,
        category: category.name.trim() !== '' ? category.name : 'Uncategorized',
        name: item.name.trim() !== '' ? item.name : 'Unknown Item',
        description: typeof item.description === 'string' && item.description.trim() !== '' ? item.description : undefined,
        price: typeof item.price === 'number' && !Number.isNaN(item.price) ? item.price : undefined,
        dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags : [],
      };
    }).filter(item => item !== null) as MenuItem[] // Filter out nulls and assert type. 'Boolean' constructor is not needed.
  );
}

async function insertMenuItems(truckId: string, menuData: MenuCategory[] | unknown[] | undefined) {
  if (!supabaseAdmin) { // Added check for supabaseAdmin
    console.error('supabaseAdmin is not initialized. Cannot insert menu items.');
    return;
  }
  const menuItems = prepareMenuItemsForInsert(truckId, menuData);
  if (menuItems.length === 0) {
    return;
  }
  const { error: menuError } = await supabaseAdmin.from('menu_items').insert(menuItems); // Removed ! assertion
  if (menuError) {
    console.error('Error inserting menu items for truck', truckId, menuError);
  }
}

// Fix all strict-boolean-expressions and always-true/false comparisons below
// Example: if (someString) => if (typeof someString === 'string' && someString.trim() !== '')
// Example: if (someNumber) => if (typeof someNumber === 'number' && !Number.isNaN(someNumber) && someNumber !== 0)
// Example: if (someObject) => if (someObject != null && someObject != undefined)

// For all other conditionals, ensure explicit nullish/empty/NaN checks as above

export {type PostgrestError, type PostgrestResponse} from '@supabase/supabase-js';
