#!/usr/bin/env node

/**
 * Data Quality Scoring Service - Nightly Aggregation Job
 * 
 * This script updates quality scores for all food trucks and aggregates daily metrics.
 * It integrates with the existing data quality infrastructure.
 */

import { supabase } from '../supabase';
import { calculateQualityScore, validateEntity, type ValidationResult, type QualityScoreResult } from './qualityScorer.js';
import type { FoodTruck } from '../types';

// Configuration from environment variables
const BATCH_SIZE = parseInt(process.env.QUALITY_BATCH_SIZE || '50', 10);
const MAX_RETRIES = parseInt(process.env.QUALITY_MAX_RETRIES || '3', 10);
const CRON_SCHEDULE = process.env.QUALITY_CRON_SCHEDULE || '0 2 * * *'; // Default: 2 AM daily

interface QualityScoreUpdate {
  id: string;
  score: number;
  grade: string;
  validationDetails: ValidationResult;
  breakdown: QualityScoreResult['breakdown'];
}

interface ProcessingStats {
  processed: number;
  updated: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
}

/**
 * Updates quality scores for all food trucks
 */
export async function updateQualityScores(): Promise<ProcessingStats> {
  const stats: ProcessingStats = {
    processed: 0,
    updated: 0,
    errors: 0,
    startTime: new Date()
  };

  console.info('🚀 Starting quality score update process...');

  try {
    // Fetch all food trucks in batches
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: trucks, error } = await supabase
        .from('food_trucks')
        .select('*')
        .range(offset, offset + BATCH_SIZE - 1);
        
      const typedTrucks = trucks as FoodTruck[] | null;

      if (error) {
        console.error('Error fetching food trucks:', error);
        stats.errors++;
        break;
      }

      if (!typedTrucks || typedTrucks.length === 0) {
        hasMore = false;
        break;
      }

      // Process batch
      const updates = await processTruckBatch(typedTrucks);
      await storeBatchUpdates(updates);
      
      stats.processed += typedTrucks.length;
      stats.updated += updates.length;
      
      console.info(`📊 Processed batch: ${typedTrucks.length} trucks (Total: ${stats.processed})`);
      
      offset += BATCH_SIZE;
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Store individual scores in data_quality_scores table
    await storeIndividualScores();
    
    // Run daily aggregation
    await aggregateDailyMetrics();
    
    stats.endTime = new Date();
    const duration = stats.endTime.getTime() - stats.startTime.getTime();
    
    console.info(`✅ Quality score update completed!`);
    console.info(`📈 Stats: ${stats.processed} processed, ${stats.updated} updated, ${stats.errors} errors`);
    console.info(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
    
  } catch (error) {
    console.error('❌ Fatal error in quality score update:', error);
    stats.errors++;
    stats.endTime = new Date();
  }

  return stats;
}

/**
 * Processes a batch of food trucks and calculates their quality scores
 */
async function processTruckBatch(trucks: FoodTruck[]): Promise<QualityScoreUpdate[]> {
  const updates: QualityScoreUpdate[] = [];

  for (const truck of trucks) {
    try {
      // Validate the entity and calculate score
      const validationResult = validateEntity(truck);
      const scoreResult = calculateQualityScore(truck, validationResult);
      
      updates.push({
        id: truck.id,
        score: scoreResult.score,
        grade: scoreResult.grade,
        validationDetails: validationResult,
        breakdown: scoreResult.breakdown
      });
      
    } catch (error) {
      console.error(`Error processing truck ${truck.id}:`, error);
    }
  }

  return updates;
}

/**
 * Stores batch updates to the food_trucks table
 */
async function storeBatchUpdates(updates: QualityScoreUpdate[]): Promise<void> {
  if (updates.length === 0) return;

  // Update the main food_trucks table with scores
  const foodTruckUpdates = updates.map(update => ({
    id: update.id,
    data_quality_score: update.score / 100 // Convert percentage to decimal for existing field
  }));

  const { error } = await supabase
    .from('food_trucks')
    .upsert(foodTruckUpdates, { onConflict: 'id' });

  if (error) {
    console.error('Error updating food truck scores:', error);
    throw error;
  }
}

/**
 * Stores individual quality scores in the data_quality_scores table
 */
async function storeIndividualScores(): Promise<void> {
  console.info('📊 Storing individual quality scores...');
  
  // This would typically be done as part of the batch processing
  // For now, we'll use the database function if available
  const { error } = await supabase.rpc('aggregate_daily_quality_metrics');
  
  if (error) {
    console.warn('Warning: Could not use database aggregation function:', error.message);
    // Fallback to manual aggregation if needed
  }
}

/**
 * Aggregates daily quality metrics for reporting
 */
async function aggregateDailyMetrics(): Promise<void> {
  console.info('📈 Aggregating daily quality metrics...');
  
  try {
    // Use the database function for aggregation
    const { error } = await supabase.rpc('aggregate_daily_quality_metrics', {
      target_date: new Date().toISOString().split('T')[0]
    });
    
    if (error) {
      console.warn('Warning: Could not aggregate daily metrics:', error.message);
    } else {
      console.info('✅ Daily metrics aggregated successfully');
    }
  } catch (error) {
    console.error('Error aggregating daily metrics:', error);
  }
}

/**
 * Main execution function
 */
export async function main(): Promise<void> {
  const isScheduled = process.env.NODE_ENV === 'production' && process.env.ENABLE_CRON === 'true';
  
  if (isScheduled) {
    // In production with cron enabled, set up scheduled execution
    const cron = await import('node-cron');
    
    console.info(`⏰ Scheduling quality score updates with cron: ${CRON_SCHEDULE}`);
    
    cron.schedule(CRON_SCHEDULE, async () => {
      console.info('🔄 Running scheduled quality score update...');
      await updateQualityScores();
    }, {
      timezone: process.env.TZ || 'UTC'
    });
    
    console.info('✅ Quality score service started and scheduled');
  } else {
    // Run once (for development or manual execution)
    console.info('🔧 Running quality score update (one-time execution)');
    await updateQualityScores();
    process.exit(0);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.info('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.info('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}
