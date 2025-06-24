/**
 * SOTA Batch Data Cleanup System
 * Implements automated data quality improvements and cleanup operations
 */

import { FoodTruckService, type FoodTruck, DataQualityService } from '@/lib/supabase';
import { DuplicatePreventionService } from './duplicatePrevention';

export interface CleanupOperation {
  type: 'normalize_phone' | 'fix_coordinates' | 'remove_placeholders' | 'update_quality_scores' | 'merge_duplicates';
  description: string;
  affectedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export interface BatchCleanupResult {
  totalProcessed: number;
  operations: CleanupOperation[];
  summary: {
    trucksImproved: number;
    duplicatesRemoved: number;
    qualityScoreImprovement: number;
    placeholdersRemoved: number;
  };
  duration: number;
}

/**
 * Automated Data Quality Cleanup Service
 */
export class BatchCleanupService {
  
  /**
   * Run comprehensive data cleanup operations
   */
  static async runFullCleanup(options: {
    batchSize?: number;
    dryRun?: boolean;
    operations?: CleanupOperation['type'][];
  } = {}): Promise<BatchCleanupResult> {
    const startTime = Date.now();
    const { batchSize = 50, dryRun = false, operations = [
      'remove_placeholders',
      'normalize_phone',
      'fix_coordinates',
      'update_quality_scores',
      'merge_duplicates'
    ] } = options;

    console.info(`Starting batch cleanup (${dryRun ? 'DRY RUN' : 'LIVE'})...`);

    const result: BatchCleanupResult = {
      totalProcessed: 0,
      operations: [],
      summary: {
        trucksImproved: 0,
        duplicatesRemoved: 0,
        qualityScoreImprovement: 0,
        placeholdersRemoved: 0
      },
      duration: 0
    };

    try {
      const allTrucks = await FoodTruckService.getAllTrucks();
      result.totalProcessed = allTrucks.total;

      await this.processTrucksInBatches(allTrucks.trucks, {
        batchSize,
        operations,
        dryRun,
        result
      });

      return this.finalizeCleanupResult(result, startTime);

    } catch (error) {
      console.error('Batch cleanup failed:', error);
      throw error;
    }
  }

  private static finalizeCleanupResult(result: BatchCleanupResult, startTime: number): BatchCleanupResult {
    result.summary = this.calculateSummary(result.operations);
    result.duration = Date.now() - startTime;

    console.info(`Batch cleanup completed in ${result.duration}ms`);
    return result;
  }

  private static async processTrucksInBatches(
    trucks: FoodTruck[],
    { batchSize, operations, dryRun, result }: {
      batchSize: number;
      operations: CleanupOperation['type'][];
      dryRun: boolean;
      result: BatchCleanupResult;
    }
  ): Promise<void> {
    for (let i = 0; i < trucks.length; i += batchSize) {
      const batch = trucks.slice(i, i + batchSize);
      for (const operation of operations) {
        const opResult = await this.runOperation(operation, batch, dryRun);
        result.operations.push(opResult);
      }
    }
  }
  
  /**
   * Run a specific cleanup operation
   */
  private static async runOperation(
    type: CleanupOperation['type'],
    trucks: FoodTruck[],
    dryRun: boolean
  ): Promise<CleanupOperation> {
    const operation: CleanupOperation = {
      type,
      description: this.getOperationDescription(type),
      affectedCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: []
    };
    
    try {
      switch (type) {
        case 'remove_placeholders': {
          return await this.removePlaceholders(trucks, dryRun, operation);
        }
        case 'normalize_phone': {
          return await this.normalizePhoneNumbers(trucks, dryRun, operation);
        }
        case 'fix_coordinates': {
          return await this.fixCoordinates(trucks, dryRun, operation);
        }
        case 'update_quality_scores': {
          return await this.updateQualityScores(trucks, dryRun, operation);
        }
        case 'merge_duplicates': {
          return await this.mergeDuplicates(trucks, dryRun, operation);
        }
        default: {
          operation.errors.push(`Unknown operation type: ${String(type)}`);
          return operation;
        }
      }
    } catch (error) {
      operation.errors.push(`Operation failed: ${error instanceof Error ? error.message : String(error)}`);
      return operation;
    }
  }
  
  /**
   * Get placeholder detection patterns
   */
  private static getPlaceholderPatterns(): RegExp[] {
    return [
      /undefined/i,
      /placeholder/i,
      /example\.com/i,
      /test\s*truck/i,
      /lorem\s*ipsum/i,
      /\bna\b/i,
      /\bn\/a\b/i,
      /^0+$/,
      /^null$/i
    ];
  }

  /**
   * Check if truck data needs placeholder cleanup
   */
  private static checkForPlaceholders(truck: FoodTruck, patterns: RegExp[]): { updates: Partial<FoodTruck>; needsUpdate: boolean } {
    const updates: Partial<FoodTruck> = {};
    let needsUpdate = false;

    // Check name
    if (truck.name && patterns.some(pattern => pattern.test(truck.name ?? ''))) {
      updates.name = undefined;
      needsUpdate = true;
    }

    // Check description
    if (truck.description !== undefined && typeof truck.description === 'string' && patterns.some(pattern => pattern.test(truck.description ?? ''))) {
      updates.description = undefined;
      needsUpdate = true;
    }

    // Check price range
    if (truck.price_range !== undefined && typeof truck.price_range === 'string' && patterns.some(pattern => pattern.test(truck.price_range ?? ''))) {
      updates.price_range = undefined;
      needsUpdate = true;
    }

    return { updates, needsUpdate };
  }

  /**
   * Remove placeholder and mock data
   */
  private static async removePlaceholders(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<CleanupOperation> {
    const placeholderPatterns = this.getPlaceholderPatterns();

    for (const truck of trucks) {
      const { updates, needsUpdate } = this.processTruckForPlaceholders(truck, placeholderPatterns);

      if (needsUpdate) {
        await this.performUpdateOperation(truck.id, updates, dryRun, operation);
      }
    }

    return operation;
  }

  private static processTruckForPlaceholders(truck: FoodTruck, patterns: RegExp[]): { updates: Partial<FoodTruck>; needsUpdate: boolean } {
    let updates: Partial<FoodTruck> = {};
    let needsUpdate = false;

    // Process basic info
    const basicInfoResult = this.checkForPlaceholders(truck, patterns);
    if (basicInfoResult.needsUpdate) {
      updates = { ...updates, ...basicInfoResult.updates };
      needsUpdate = true;
    }

    // Process contact info
    const contactInfoResult = this.processContactInfoForPlaceholders(truck, patterns);
    if (contactInfoResult.contactUpdated) {
      updates.contact_info = contactInfoResult.cleanContact;
      needsUpdate = true;
    }

    // Process address info
    const addressResult = this.processAddressForPlaceholders(truck, patterns);
    if (addressResult.addressUpdated) {
      updates.current_location = {
        ...truck.current_location,
        ...addressResult.updatedLocation
      };
      needsUpdate = true;
    }

    return { updates, needsUpdate };
  }

  private static processContactInfoForPlaceholders(truck: FoodTruck, patterns: RegExp[]): { cleanContact: Partial<FoodTruck['contact_info']>; contactUpdated: boolean } {
    const cleanContact: Partial<FoodTruck['contact_info']> = { ...truck.contact_info };
    let contactUpdated = false;

    if (cleanContact.phone !== undefined && typeof cleanContact.phone === 'string' && patterns.some(pattern => pattern.test(cleanContact.phone ?? ''))) {
      cleanContact.phone = undefined;
      contactUpdated = true;
    }
    if (cleanContact.website !== undefined && typeof cleanContact.website === 'string' && patterns.some(pattern => pattern.test(cleanContact.website ?? ''))) {
      cleanContact.website = undefined;
      contactUpdated = true;
    }
    if (cleanContact.email !== undefined && typeof cleanContact.email === 'string' && patterns.some(pattern => pattern.test(cleanContact.email ?? ''))) {
      cleanContact.email = undefined;
      contactUpdated = true;
    }
    return { cleanContact, contactUpdated };
  }

  private static processAddressForPlaceholders(truck: FoodTruck, patterns: RegExp[]): { updatedLocation: Partial<FoodTruck['current_location']>; addressUpdated: boolean } {
    let addressUpdated = false;
    const updatedLocation: Partial<FoodTruck['current_location']> = { ...truck.current_location };

    if (truck.current_location?.address !== undefined && typeof truck.current_location.address === 'string' && patterns.some(pattern => pattern.test(truck.current_location.address ?? ''))) {
      updatedLocation.address = undefined;
      addressUpdated = true;
    }
    return { updatedLocation, addressUpdated };
  }

  private static async performUpdateOperation(
    truckId: string,
    updates: Partial<FoodTruck>,
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<void> {
    operation.affectedCount++;
    if (dryRun) {
      operation.successCount++;
    } else {
      try {
        await FoodTruckService.updateTruck(truckId, updates);
        operation.successCount++;
      } catch (error) {
        operation.errorCount++;
        operation.errors.push(`Failed to update truck ${truckId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  /**
   * Normalize phone numbers to consistent format
   */
  private static async normalizePhoneNumbers(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<CleanupOperation> {
    for (const truck of trucks) {
      if (truck.contact_info?.phone !== undefined) {
        const originalPhone = truck.contact_info.phone;
        const normalizedPhone = this.normalizePhone(originalPhone);

        if (normalizedPhone !== undefined && normalizedPhone !== originalPhone) {
          operation.affectedCount++;
          
          if (dryRun) {
            operation.successCount++;
          } else {
            try {
              await FoodTruckService.updateTruck(truck.id, {
                contact_info: {
                  ...truck.contact_info,
                  phone: normalizedPhone
                }
              });
              operation.successCount++;
            } catch (error) {
              operation.errorCount++;
              operation.errors.push(`Failed to normalize phone for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
    }
    
    return operation;
  }
  
  /**
   * Helper to determine if coordinates need fixing and provide updates
   */
  private static getFixedCoordinates(
    lat: number | undefined,
    lng: number | undefined,
    defaultLat: number,
    defaultLng: number
  ): Partial<FoodTruck['current_location']> | null {
    // Fix invalid coordinates (0,0 or undefined)
    if (lat === undefined || lat === 0 || lng === undefined || lng === 0) {
      return { lat: defaultLat, lng: defaultLng };
    }
    // Fix coordinates outside reasonable bounds for Charleston area
    if (lat < 32 || lat > 34 || lng > -79 || lng < -81) {
      return { lat: defaultLat, lng: defaultLng };
    }
    return null;
  }

  /**
   * Fix invalid GPS coordinates
   */
  private static async fixCoordinates(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<CleanupOperation> {
    // Charleston, SC default coordinates
    const defaultLat = 32.7767;
    const defaultLng = -79.9311;

    for (const truck of trucks) {
      if (truck.current_location !== undefined) {
        const { lat, lng } = truck.current_location;
        const updates = this.getFixedCoordinates(lat, lng, defaultLat, defaultLng);
        if (updates) {
          await this.applyCoordinateFixUpdate(truck, updates, dryRun, operation);
        }
      }
    }
    return operation;
  }

  private static async applyCoordinateFixUpdate(
    truck: FoodTruck,
    updates: Partial<FoodTruck['current_location']>,
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<void> {
    operation.affectedCount++;
    if (dryRun) {
      operation.successCount++;
    } else {
      try {
        await FoodTruckService.updateTruck(truck.id, {
          current_location: {
            ...truck.current_location,
            lat: updates.lat as number,
            lng: updates.lng as number,
          }
        });
        operation.successCount++;
      } catch (error) {
        operation.errorCount++;
        operation.errors.push(`Failed to fix coordinates for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Update quality scores for all trucks
   */
  private static async updateQualityScores(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<CleanupOperation> {
    for (const truck of trucks) {
      const qualityAssessment: { score: number } = DataQualityService.calculateQualityScore(truck);
      const newScore: number = qualityAssessment.score;
      const currentScore = truck.data_quality_score ?? 0;
      // Only update if score changed significantly (>5% difference)
      if (Math.abs(newScore - currentScore) > 0.05) {
        await this.applyQualityScoreUpdate(truck, dryRun, operation);
      }
    }
    return operation;
  }

  private static async applyQualityScoreUpdate(
    truck: FoodTruck,
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<void> {
    operation.affectedCount++;
    if (dryRun) {
      operation.successCount++;
    } else {
      try {
        const updateResult = await DataQualityService.updateTruckQualityScore(truck.id);
        if ('error' in updateResult) {
          throw new Error(updateResult.error);
        }
        operation.successCount++;
      } catch (error) {
        operation.errorCount++;
        operation.errors.push(`Failed to update quality score for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  /**
   * Identify and merge duplicate trucks
   */
  private static async mergeDuplicates(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<CleanupOperation> {
    const processedIds = new Set<string>();
    for (const truck of trucks) {
      if (processedIds.has(truck.id)) continue;
      const duplicateCheck = await DuplicatePreventionService.checkForDuplicates(truck);
      if (duplicateCheck.isDuplicate && duplicateCheck.bestMatch) {
        const { bestMatch } = duplicateCheck;
        if (bestMatch.confidence === 'high' && bestMatch.recommendation === 'merge') {
          await this.applyMergeOperation(truck, bestMatch.existingTruck, dryRun, operation, processedIds);
        }
      }
      processedIds.add(truck.id);
    }
    return operation;
  }

  private static async applyMergeOperation(
    truck: FoodTruck,
    existingTruck: FoodTruck,
    dryRun: boolean,
    operation: CleanupOperation,
    processedIds: Set<string>
  ): Promise<void> {
    operation.affectedCount++;
    if (dryRun) {
      operation.successCount++;
    } else {
      try {
        const mergeResult = await DuplicatePreventionService.mergeDuplicates(truck.id, existingTruck.id);
        if ('error' in mergeResult) {
          throw new Error(mergeResult.error);
        }
        processedIds.add(existingTruck.id);
        operation.successCount++;
      } catch (error) {
        operation.errorCount++;
        operation.errors.push(`Failed to merge duplicates ${truck.id} and ${existingTruck.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  /**
   * Normalize phone number format
   */
  private static normalizePhone(phone: string): string | undefined {
    if (!phone) return undefined;
    
    // Remove all non-digit characters
    const digits = phone.replaceAll(/\D/g, '');
    
    // Handle US phone numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    // Return original if can't normalize
    return phone;
  }
  
  /**
   * Get operation description
   */
  private static getOperationDescription(type: CleanupOperation['type']): string {
    const descriptions = {
      remove_placeholders: 'Remove placeholder and mock data values',
      normalize_phone: 'Normalize phone numbers to consistent format',
      fix_coordinates: 'Fix invalid GPS coordinates',
      update_quality_scores: 'Recalculate data quality scores',
      merge_duplicates: 'Identify and merge duplicate truck entries'
    };
    
    return descriptions[type] ?? 'Unknown operation';
  }
  
  /**
   * Calculate cleanup summary
   */
  private static calculateSummary(operations: CleanupOperation[]): BatchCleanupResult['summary'] {
    return {
      trucksImproved: operations.reduce((sum, op) => sum + op.successCount, 0),
      duplicatesRemoved: operations.find(op => op.type === 'merge_duplicates')?.successCount ?? 0,
      qualityScoreImprovement: operations.find(op => op.type === 'update_quality_scores')?.successCount ?? 0,
      placeholdersRemoved: operations.find(op => op.type === 'remove_placeholders')?.successCount ?? 0
    };
  }
}
