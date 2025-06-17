/**
 * SOTA Batch Data Cleanup System
 * Implements automated data quality improvements and cleanup operations
 */

import { FoodTruckService, DataQualityService, type FoodTruck } from '@/lib/supabase';
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
      for (let i = 0; i < allTrucks.trucks.length; i += batchSize) {
        const batch = allTrucks.trucks.slice(i, i + batchSize);
        
        for (const operation of operations) {
          const opResult = await this.runOperation(operation, batch, dryRun);
          result.operations.push(opResult);
        }
      }
      
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
   * Remove placeholder and mock data
   */
  private static async removePlaceholders(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<CleanupOperation> {
    const placeholderPatterns = [
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
    
    for (const truck of trucks) {
      let needsUpdate = false;
      const updates: Partial<FoodTruck> = {};
      
      // Check name
      if (truck.name && placeholderPatterns.some(pattern => pattern.test(truck.name))) {
        updates.name = undefined;
        needsUpdate = true;
      }
      
      // Check description
      if (truck.description !== undefined && typeof truck.description === 'string' && placeholderPatterns.some(pattern => pattern.test(truck.description))) {
        updates.description = undefined;
        needsUpdate = true;
      }

      // Check price range
      if (truck.price_range && typeof truck.price_range === 'string' && placeholderPatterns.some(pattern => pattern.test(truck.price_range))) {
        updates.price_range = undefined;
        needsUpdate = true;
      }
      
      // Check contact info
      if (truck.contact_info) {
        const cleanContact = { ...truck.contact_info };
        let contactUpdated = false;
        
        if (cleanContact.phone !== undefined && typeof cleanContact.phone === 'string' && placeholderPatterns.some(pattern => pattern.test(cleanContact.phone))) {
          cleanContact.phone = undefined;
          contactUpdated = true;
        }

        if (cleanContact.website !== undefined && typeof cleanContact.website === 'string' && placeholderPatterns.some(pattern => pattern.test(cleanContact.website))) {
          cleanContact.website = undefined;
          contactUpdated = true;
        }

        if (cleanContact.email !== undefined && typeof cleanContact.email === 'string' && placeholderPatterns.some(pattern => pattern.test(cleanContact.email))) {
          cleanContact.email = undefined;
          contactUpdated = true;
        }
        
        if (contactUpdated) {
          updates.contact_info = cleanContact;
          needsUpdate = true;
        }
      }
      
      // Check address
      if (truck.current_location?.address !== undefined && typeof truck.current_location.address === 'string' && placeholderPatterns.some(pattern => pattern.test(truck.current_location.address))) {
        updates.current_location = {
          ...truck.current_location,
          address: undefined
        };
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
      if (truck.current_location !== undefined) {
        const { lat, lng } = truck.current_location;
        let needsUpdate = false;
        const updates: Partial<FoodTruck['current_location']> = {};

        // Fix invalid coordinates (0,0 or null)
        if (lat === undefined || lat === 0 || lng === undefined || lng === 0) {
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
          operation.affectedCount++;
          
          if (dryRun) {
            operation.successCount++;
          } else {
            try {
              await FoodTruckService.updateTruck(truck.id, {
                current_location: {
                  ...truck.current_location,
                  ...updates
                }
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
  
  /**
   * Update quality scores for all trucks
   */
  private static async updateQualityScores(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation
  ): Promise<CleanupOperation> {
    for (const truck of trucks) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const qualityAssessment = DataQualityService.calculateQualityScore(truck);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const newScore = qualityAssessment.score;
      const currentScore = truck.data_quality_score ?? 0;
      
      // Only update if score changed significantly (>5% difference)
      if (Math.abs(newScore - currentScore) > 0.05) {
        operation.affectedCount++;
        
        if (dryRun) {
          operation.successCount++;
        } else {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            await DataQualityService.updateTruckQualityScore(truck.id);
            operation.successCount++;
          } catch (error) {
            operation.errorCount++;
            operation.errors.push(`Failed to update quality score for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
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
      if (processedIds.has(truck.id)) continue;
      
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
    
    return operation;
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
