import {
  createClient,
  type PostgrestSingleResponse,
  type PostgrestResponse,
  type PostgrestError,
} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (supabaseAnonKey === undefined || supabaseAnonKey === '') {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Only create admin client on server side where service key is available
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : undefined;

// Database types
import { MenuCategory, MenuItem } from './types';

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
/**
* Groups menu items by their associated food truck ID.
* @example
* buildMenuByTruck([{ food_truck_id: '1', name: 'Burger' }, { food_truck_id: '2', name: 'Pizza' }])
* { '1': [{ food_truck_id: '1', name: 'Burger' }], '2': [{ food_truck_id: '2', name: 'Pizza' }] }
* @param {RawMenuItemFromDB[]} menuItems - Array of menu items where each item must have a food truck ID.
* @returns {Record<string, RawMenuItemFromDB[]>} A record with keys of food truck IDs and values of arrays of menu items.
* @description
*   - Ensures only menu items with valid, non-empty food truck IDs are included.
*   - Initializes an array for each unique food truck ID, grouping corresponding menu items.
*/
function buildMenuByTruck(menuItems: RawMenuItemFromDB[]): Record<string, RawMenuItemFromDB[]> {
  const menuByTruck: Record<string, RawMenuItemFromDB[]> = {};
  for (const item of menuItems) {
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
  async getAllTrucks(
    limit = 50,
    offset = 0,
  ): Promise<{ trucks: FoodTruck[]; total: number; error?: string }> {
    try {
      const { data, error, count }: PostgrestResponse<FoodTruck> = await supabase
        .from('food_trucks')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      const trucks: FoodTruck[] = (data ?? []).map((t: FoodTruck) => normalizeTruckLocation(t));
      if (trucks.length === 0) return { trucks: [], total: count ?? 0 };
      const truckIds = trucks.map((t: FoodTruck) => t.id);
      let menuItems: RawMenuItemFromDB[] = [];
      try {
        if (truckIds.length > 0) {
          const { data: items, error: menuError }: PostgrestResponse<RawMenuItemFromDB> =
            await supabase.from('menu_items').select('*').in('food_truck_id', truckIds);
          if (menuError) throw new Error(menuError.message);
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
      if (error) throw error;
      if (!data) {
        return { error: "That didn't work, please try again later." };
      }
      const truck: FoodTruck = normalizeTruckLocation(data);
      const { data: items, error: menuError }: PostgrestResponse<RawMenuItemFromDB> = await supabase
        .from('menu_items')
        .select('*')
        .eq('food_truck_id', id);
      if (menuError) throw menuError;
      truck.menu = groupMenuItems(Array.isArray(items) ? items : []);
      return truck;
    } catch (error) {
      handleSupabaseError(error, 'getTruckById');
      return { error: "That didn't work, please try again later." };
    }
  },

  async getTrucksByLocation(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<FoodTruck[] | { error: string }> {
    try {
      const { trucks } = await FoodTruckService.getAllTrucks();
      const nearbyTrucks = trucks.filter((truck: FoodTruck) => {
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
      return { error: 'Failed to create truck.' };
    }
    await insertMenuItems(truck.id, menuData);
    return truck;
  },

  async updateTruck(
    id: string,
    updates: Partial<FoodTruck>,
  ): Promise<FoodTruck | { error: string }> {
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
    if (menuData != undefined) {
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
const isMenuCategory = (obj: unknown): obj is MenuCategory =>
  typeof obj === 'object' &&
  obj != undefined &&
  'name' in obj &&
  'items' in obj &&
  Array.isArray(obj.items);

/**
 * Determines whether the given object is a MenuItem.
 * @example
 * isMenuItem({ name: "Pizza", description: "Delicious", price: 9.99, dietary_tags: ["Vegetarian"] })
 * true
 * @param {unknown} obj - The object to be checked.
 * @returns {boolean} Returns true if the object has properties consistent with a MenuItem.
 * @description
 *   - Checks if 'name' is a string.
 *   - Checks if 'description' is either undefined or a string.
 *   - Checks if 'price' is either undefined or a number.
 *   - Ensures 'dietary_tags' is either undefined or an array of strings.
 */
const isMenuItem = (obj: unknown): obj is MenuItem => {
  if (typeof obj !== 'object' || obj == undefined) return false;
  const item = obj as Record<string, unknown>;
  return (
    typeof item.name === 'string' &&
    (item.description === undefined || typeof item.description === 'string') &&
    (item.price === undefined || typeof item.price === 'number') &&
    (item.dietary_tags === undefined ||
      (Array.isArray(item.dietary_tags) &&
        item.dietary_tags.every((tag) => typeof tag === 'string')))
  );
};

/**
* Updates the food truck data for a given truck ID with provided updates.
* @example
* updateTruckData('truck123', { name: 'New Truck Name', location: 'Downtown' })
* { id: 'truck123', name: 'New Truck Name', location: 'Downtown', ... }
* @param {string} id - The ID of the food truck to be updated.
* @param {Partial<FoodTruck>} updatesWithoutMenu - Partial object containing truck attributes to be updated, excluding menu items.
* @returns {Promise<FoodTruck | { error: string }>} Returns the updated FoodTruck object or an error message upon failure.
* @description
*   - Requires SUPABASE_SERVICE_ROLE_KEY to perform operations.
*   - Updates only non-menu details of the food truck.
*   - Selects and returns the single updated record from the database.
*   - Handles errors by invoking handleSupabaseError and returns an error message if any issues occur during update.
*/
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
    return { error: 'Failed to update truck data.' };
  }
  return truck;
}

/**
 * Updates the menu items for a specific food truck in the Supabase database.
 * @example
 * updateTruckMenu('truck123', menuData)
 * Promise<void> // Updates the menu items and resolves a promise.
 * @param {string} id - Identifier for the food truck whose menu is being updated.
 * @param {MenuCategory[] | unknown[]} menuData - Array containing menu category objects or unknown objects.
 * @returns {Promise<void>} Resolves a promise when the operation is complete.
 * @description
 *   - Requires `SUPABASE_SERVICE_ROLE_KEY` to perform admin operations.
 *   - Deletes existing menu items before inserting updated ones.
 *   - Handles invalid categories or menu items by skipping them and logs warnings.
 */
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
  }

  // Insert new menu items if they exist
  if (menuData != undefined && menuData.length > 0) {
    const menuItems = menuData.flatMap((category: unknown) => {
      if (!isMenuCategory(category)) {
        console.warn('Skipping invalid category in updateTruckMenu:', category);
        return [];
      }

      return (category.items ?? []).map((item: unknown) => {
        if (!isMenuItem(item)) {
          console.warn('Skipping invalid menu item in updateTruckMenu:', item);
          // Return a default valid MenuItem or skip based on requirements
          return {
            food_truck_id: id,
            category: category.name ?? 'Uncategorized',
            name: 'Unknown Item',
            description: undefined,
            price: undefined,
            dietary_tags: [],
          };
        }

        return {
          food_truck_id: id,
          category: category.name ?? 'Uncategorized',
          name: item.name ?? 'Unknown Item',
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
      }
    }
  }
}

/**
* Computes the distance between two geographical points using the Haversine formula.
* @example
* calculateDistance(51.5074, -0.1278, 40.7128, -74.0060)
* 5585.107071089907
* @param {number} lat1 - Latitude of the first point in decimal degrees.
* @param {number} lon1 - Longitude of the first point in decimal degrees.
* @param {number} lat2 - Latitude of the second point in decimal degrees.
* @param {number} lon2 - Longitude of the second point in decimal degrees.
* @returns {number} The distance between the two points in kilometers.
* @description
*   - Uses Haversine formula to account for Earth's curvature.
*   - Assumes Earth’s radius is 6371 kilometers.
*   - Angles should be provided in decimal degrees, not radians.
*/
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

/**
 * Groups raw menu items into categories based on their category property.
 * @example
 * groupMenuItems([{name: 'Salad', category: 'Appetizers'}, {name: 'Burger'}])
 * // Returns: [{name: 'Appetizers', items: [{name: 'Salad', description: undefined, price: undefined, dietary_tags: []}]}, 
 * //           {name: 'Uncategorized', items: [{name: 'Burger', description: undefined, price: undefined, dietary_tags: []}]}]
 * @param {RawMenuItemFromDB[]} rawItems - Array of raw menu items from the database.
 * @returns {MenuCategory[]} A list of menu categories with categorized menu items.
 * @description
 *   - Wraps raw menu items into a structured format separating them by categories.
 *   - Uses the nullish coalescing operator to handle null and undefined values from the database.
 *   - Explicitly casts dietary tags to an array of strings.
 */
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
      dietary_tags: (rawItem.dietary_tags as string[]) ?? [], // Explicitly cast to string[]
    };
    byCategory[categoryName].push(menuItem);
  }
  // Map to MenuCategory structure { name: string, items: MenuItem[] }
  return Object.entries(byCategory).map(([categoryName, itemsList]: [string, MenuItem[]]) => ({
    name: categoryName,
    items: itemsList,
  }));
}

// Remove redundant type constituent in normalizeTruckLocation
/**
 * Normalizes the location of a food truck by selecting the most accurate available location data.
 * @example
 * normalizeTruckLocation(truckInstance)
 * returns truckInstance with updated current_location property
 * @param {FoodTruck} truck - A food truck object whose location needs normalization.
 * @returns {FoodTruck} A food truck object with a standardized current location.
 * @description
 *   - If no valid latitude or longitude is found, it defaults to the fallback location.
 *   - The function prioritizes exact_location over current_location and city_location.
 *   - Ensures that the address is populated even if only latitude and longitude are available.
 *   - Uses the current timestamp when none is provided in the location data.
 */
function normalizeTruckLocation(truck: FoodTruck): FoodTruck {
  const fallback: FoodTruckLocation = {
    lat: 0,
    lng: 0,
    address: 'Unknown',
    timestamp: new Date().toISOString(),
  };
  const loc = truck.exact_location ?? truck.current_location ?? truck.city_location ?? {};
  const lat = typeof loc.lat === 'number' ? loc.lat : 0;
  const lng = typeof loc.lng === 'number' ? loc.lng : 0;
  const {address} = loc;
  const {timestamp} = loc;

  truck.current_location =
    lat === 0 || lng === 0
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
      const query = supabase.from('scraping_jobs').select('*');

      const { data, error }: PostgrestResponse<ScrapingJob> = await (
        status === 'all' ? query : query.eq('status', status)
      )
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
        .order('priority', { ascending: false })
        .order('scheduled_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
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

    if (error !== null && String(error.code) != 'PGRST116') throw error;
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
      typeof truck.current_location.lat === 'number' &&
      !Number.isNaN(truck.current_location.lat) &&
      typeof truck.current_location.lng === 'number' &&
      !Number.isNaN(truck.current_location.lng)
    )
      score += 30;
    if (
      truck.contact_info &&
      ((typeof truck.contact_info.phone === 'string' && truck.contact_info.phone.trim() !== '') ||
        (typeof truck.contact_info.email === 'string' && truck.contact_info.email.trim() !== '') ||
        (typeof truck.contact_info.website === 'string' &&
          truck.contact_info.website.trim() !== ''))
    )
      score += 25;
    if (Array.isArray(truck.menu) && truck.menu.length > 0) score += 15;
    if (truck.operating_hours != undefined) score += 10;
    return { score: Math.min(100, score) };
  },

  async updateTruckQualityScore(truckId: string): Promise<FoodTruck | { error: string }> {
    if (!supabaseAdmin) {
      return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
    }
    const { data: truck, error: fetchError } = (await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .eq('id', truckId)
      .single()) as { data: FoodTruck | undefined; error: PostgrestError | undefined };

    if (fetchError) {
      handleSupabaseError(fetchError, 'updateTruckQualityScore:fetch');
      return { error: `Failed to fetch truck with ID ${truckId}.` };
    }
    if (!truck) {
      return { error: `Truck with ID ${truckId} not found.` };
    }

    const { score } = this.calculateQualityScore(truck);

    const { data, error }: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
      .from('food_trucks')
      .update({ data_quality_score: score })
      .eq('id', truckId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'updateTruckQualityScore:update');
      return { error: `Failed to update quality score for truck with ID ${truckId}.` };
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

      const {
        data: existing,
        error: existingError,
      }: { data: ApiUsage | undefined; error: PostgrestError | undefined } = await supabaseAdmin
        .from('api_usage')
        .select('*')
        .eq('service_name', serviceName)
        .eq('usage_date', today)
        .single();

      if (existingError && existingError.code !== 'PGRST116') throw existingError;

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
      } 
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

      if (error !== null && String(error.code) != 'PGRST116') throw error;
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
/**
 * Prepares a list of menu items for insertion by filtering and transforming the input data.
 * @example
 * prepareMenuItemsForInsert("truck123", [{ name: "Beverages", items: [{name: "Tea", price: 3.00}]}])
 * [
 *   {
 *     food_truck_id: "truck123",
 *     category: "Beverages",
 *     name: "Tea",
 *     description: undefined,
 *     price: 3.00,
 *     dietary_tags: []
 *   }
 * ]
 * @param {string} truckId - Unique identifier of the food truck.
 * @param {MenuCategory[] | unknown[] | undefined} menuData - Array of menu categories or unknown data, which may contain items to insert.
 * @returns {MenuItem[]} Returns an array of valid menu items formatted for database insertion, excluding invalid entries.
 * @description
 *   - Filters input data to ensure items are of MenuCategory type.
 *   - Logs warnings for invalid menu items and skips them.
 *   - Uses default values for missing item properties such as `category`, `name`, or `price`.
 */
function prepareMenuItemsForInsert(
  truckId: string,
  menuData: MenuCategory[] | unknown[] | undefined,
) {
  if (!Array.isArray(menuData) || menuData.length === 0) return [];
  // Explicitly filter for MenuCategory to ensure type safety
  const categories = menuData.filter(
    (category): category is MenuCategory =>
      typeof category === 'object' &&
      category != undefined &&
      'name' in category &&
      'items' in category &&
      Array.isArray(category.items),
  ) as MenuCategory[];

  return categories.flatMap(
    (category) =>
      (Array.isArray(category.items) ? category.items : [])
        .map((item: unknown) => {
          if (!isMenuItem(item)) {
            console.warn('Skipping invalid menu item:', item);
            return; // Return undefined for invalid items to be filtered out later
          }

          return {
            food_truck_id: truckId,
            category:
              typeof category.name === 'string' && category.name !== ''
                ? category.name
                : 'Uncategorized',
            name: typeof item.name === 'string' && item.name !== '' ? item.name : 'Unknown Item',
            description:
              typeof item.description === 'string' && item.description !== ''
                ? item.description
                : undefined,
            price:
              typeof item.price === 'number' && !Number.isNaN(item.price) ? item.price : undefined,
            dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags : [],
          };
        })
        .filter(Boolean) as MenuItem[], // Filter out nulls and assert type
  );
}

async function insertMenuItems(truckId: string, menuData: MenuCategory[] | unknown[] | undefined) {
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
// Example: if (someObject) => if (someObject != null && someObject != undefined)

// For all other conditionals, ensure explicit nullish/empty/NaN checks as above

export { type PostgrestError, type PostgrestResponse } from '@supabase/supabase-js';
