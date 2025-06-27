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
      // Get all trucks for processing
      const allTrucks = await FoodTruckService.getAllTrucks();
      result.totalProcessed = allTrucks.total;
      
      // Process trucks in batches
      await this.processTruckBatches(allTrucks.trucks, batchSize, operations, dryRun, result);
      
      // Calculate summary
      result.summary = this.calculateSummary(result.operations);
      result.duration = Date.now() - startTime;
      
      console.info(`Batch cleanup completed in ${result.duration}ms`);
      return result;
      
    } catch (error) {
      console.error('Batch cleanup failed:', error);
      throw error;
    }
  }

  private static async processTruckBatches(
    trucks: FoodTruck[],
    batchSize: number,
    operations: CleanupOperation['type'][],
    dryRun: boolean,
    result: BatchCleanupResult
  ) {
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
    if (truck.name != undefined && truck.name !== '' && patterns.some(pattern => pattern.test(truck.name))) {
      updates.name = undefined;
      needsUpdate = true;
    }

    // Check description
    if (truck.description != undefined && truck.description !== '' && patterns.some(pattern => pattern.test(truck.description))) {
      updates.description = undefined;
      needsUpdate = true;
    }

    // Check price range
    if (truck.price_range != undefined && truck.price_range !== '' && patterns.some(pattern => pattern.test(truck.price_range))) {
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
      const { updates, needsUpdate: initialNeedsUpdate } = this.checkForPlaceholders(truck, placeholderPatterns);
      let needsUpdate = initialNeedsUpdate;

      // Check contact info
      const contactUpdates = this.checkContactInfoForPlaceholders(truck.contact_info, placeholderPatterns);
      if (contactUpdates) {
        updates.contact_info = contactUpdates;
        needsUpdate = true;
      }

      // Check address
      const addressUpdates = this.checkAddressForPlaceholders(truck.current_location, placeholderPatterns);
      if (addressUpdates) {
        updates.current_location = addressUpdates;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        operation.affectedCount++;
        
        if (dryRun) {
          operation.successCount++;
        } else {
          try {
            await FoodTruckService.updateTruck(truck.id, updates);
            operation.successCount++;
          } catch (error) {
            operation.errorCount++;
            operation.errors.push(`Failed to update truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    }
    
    return operation;
  }

  private static checkContactInfoForPlaceholders(
    contactInfo: FoodTruck['contact_info'],
    patterns: RegExp[]
  ): Partial<FoodTruck['contact_info']> | undefined {
    if (contactInfo == undefined) return undefined;

    const cleanContact = { ...contactInfo };
    let contactUpdated = false;

    if (cleanContact.phone != undefined && cleanContact.phone !== '' && patterns.some(pattern => pattern.test(cleanContact.phone))) {
      cleanContact.phone = undefined;
      contactUpdated = true;
    }

    if (cleanContact.website != undefined && cleanContact.website !== '' && patterns.some(pattern => pattern.test(cleanContact.website))) {
      cleanContact.website = undefined;
      contactUpdated = true;
    }

    if (cleanContact.email != undefined && cleanContact.email !== '' && patterns.some(pattern => pattern.test(cleanContact.email))) {
      cleanContact.email = undefined;
      contactUpdated = true;
    }

    return contactUpdated ? cleanContact : undefined;
  }

  private static checkAddressForPlaceholders(
    currentLocation: FoodTruck['current_location'],
    patterns: RegExp[]
  ): Partial<FoodTruck['current_location']> | undefined {
    if (currentLocation?.address != undefined && currentLocation.address !== '' && patterns.some(pattern => pattern.test(currentLocation.address))) {
      return {
        ...currentLocation,
        address: undefined
      };
    }
    return undefined;
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
      if (truck.current_location != undefined) {
        const updatedLocation = this.getValidatedCoordinates(truck.current_location, defaultLat, defaultLng);

        if (updatedLocation) {
          operation.affectedCount++;
          
          if (dryRun) {
            operation.successCount++;
          } else {
            try {
              await FoodTruckService.updateTruck(truck.id, {
                current_location: updatedLocation
              });
              operation.successCount++;
            } catch (error) {
              operation.errorCount++;
              operation.errors.push(`Failed to fix coordinates for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
    }
    
    return operation;
  }

  private static getValidatedCoordinates(
    currentLocation: FoodTruck['current_location'],
    defaultLat: number,
    defaultLng: number
  ): FoodTruck['current_location'] | undefined {
    if (!currentLocation) return undefined;

    const { lat, lng } = currentLocation;
    let needsUpdate = false;
    const updates: Partial<FoodTruck['current_location']> = {};

    // Fix invalid coordinates (0,0 or null)
    if (lat == undefined || lat === 0 || lng == undefined || lng === 0) {
      updates.lat = defaultLat;
      updates.lng = defaultLng;
      needsUpdate = true;
    }

    // Fix coordinates outside reasonable bounds for Charleston area
    if (lat != undefined && lng != undefined && (lat < 32 || lat > 34 || lng > -79 || lng < -81)) {
      updates.lat = defaultLat;
      updates.lng = defaultLng;
      needsUpdate = true;
    }

    if (needsUpdate) {
      return {
        ...currentLocation,
        ...updates
      };
    }
    return undefined;
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
      
      if (Math.abs(newScore - currentScore) <= 0.05) {
        continue;
      }

      operation.affectedCount++;

      if (dryRun) {
        operation.successCount++;
        continue;
      }

      try {
        await DataQualityService.updateTruckQualityScore(truck.id);
        operation.successCount++;
      } catch (error) {
        operation.errorCount++;
        operation.errors.push(`Failed to update quality score for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return operation;
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
      if (processedIds.has(truck.id)) {
        continue;
      }
      
      await this.processSingleTruckForDuplicates(truck, processedIds, operation, dryRun);
    }

    return operation;
  }

  private static async processSingleTruckForDuplicates(
    truck: FoodTruck,
    processedIds: Set<string>,
    operation: CleanupOperation,
    dryRun: boolean
  ): Promise<void> {
    const duplicateCheck = await DuplicatePreventionService.checkForDuplicates(truck);

    if (duplicateCheck.isDuplicate && duplicateCheck.bestMatch) {
      const { bestMatch } = duplicateCheck;

      if (bestMatch.confidence === 'high' && bestMatch.recommendation === 'merge') {
        operation.affectedCount++;

        if (dryRun) {
          operation.successCount++;
        } else {
          try {
            await DuplicatePreventionService.mergeDuplicates(truck.id, bestMatch.existingTruck.id);
            processedIds.add(bestMatch.existingTruck.id);
            operation.successCount++;
          } catch (error) {
            operation.errorCount++;
            operation.errors.push(`Failed to merge duplicates ${truck.id} and ${bestMatch.existingTruck.id}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    }
    processedIds.add(truck.id);
  }
  
  /**
   * Normalize phone number format
   */
  private static normalizePhone(phone: string): string | undefined {
    if (phone == undefined || phone === '') return undefined;
    
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
