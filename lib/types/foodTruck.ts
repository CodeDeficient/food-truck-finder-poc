export interface FoodTruck {
  id: string;
  name: string;
  description: string;
  current_location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  operating_hours: Record<string, { open: string; close: string; closed: boolean }>;
  menu: Array<{
    category: string;
    items: Array<{
      name: string;
      description: string;
      price: number;
      dietary_tags: string[];
    }>;
  }>;
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social_media: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  average_rating?: number;
  review_count?: number;
  data_quality_score: number;
  verification_status: string;
  distance?: number;
}

export interface TrucksApiResponse {
  trucks: FoodTruck[];
  // Add other properties if your API returns more, e.g., total, page, etc.
}
