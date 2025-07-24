import type { FoodTruck } from '../types';
export declare const FoodTruckService: {
    getAllTrucks(limit?: number, offset?: number): Promise<{
        trucks: FoodTruck[];
        total: number;
        error?: string;
    }>;
    getTruckById(id: string): Promise<FoodTruck | {
        error: string;
    }>;
    getTrucksByLocation(lat: number, lng: number, radiusKm: number): Promise<FoodTruck[] | {
        error: string;
    }>;
    createTruck(truckData: Partial<FoodTruck>): Promise<FoodTruck | {
        error: string;
    }>;
    updateTruck(id: string, updates: Partial<FoodTruck>): Promise<FoodTruck | {
        error: string;
    }>;
    getDataQualityStats(): Promise<{
        total_trucks: number;
        avg_quality_score: number;
        high_quality_count: number;
        medium_quality_count: number;
        low_quality_count: number;
        verified_count: number;
        pending_count: number;
        flagged_count: number;
    }>;
};
