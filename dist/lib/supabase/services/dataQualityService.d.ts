import type { FoodTruck } from '../types/index.js';
export declare const DataQualityService: {
    calculateQualityScore: (truck: FoodTruck) => {
        score: number;
    };
    updateTruckQualityScore(truckId: string): Promise<FoodTruck | {
        error: string;
    }>;
};
