import type { DataProcessingQueue } from '../types/index.js';
export declare const DataProcessingService: {
    addToQueue(queueData: Partial<DataProcessingQueue>): Promise<DataProcessingQueue>;
    getNextQueueItem(): Promise<DataProcessingQueue | undefined>;
    getQueueByStatus(status: string): Promise<DataProcessingQueue[]>;
    updateQueueItem(id: string, updates: Partial<DataProcessingQueue>): Promise<DataProcessingQueue>;
};
