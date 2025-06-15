// @ts-expect-error TS(2792): Cannot find module '@playwright/test'. Did you mea... Remove this comment to see the full error message
import { test, expect } from '@playwright/test';
// @ts-expect-error TS(2305): Module '"./utils/testUtils"' has no exported membe... Remove this comment to see the full error message
import { DatabaseTestUtils, PipelineTestUtils } from './utils/testUtils';
import { supabaseAdmin } from '../lib/supabase';

/**
 * Continuous monitoring tests for pipeline health
 * These tests can be run regularly to monitor system health
 */

test.describe('Pipeline Health Monitoring', () => {
  test('System Health Dashboard', async ({
    request
  }: any) => {
    console.info('\n=== PIPELINE HEALTH CHECK ===');

    // 1. Database Health Check
    console.info('\n1. Database Health Check');
    try {
      // @ts-expect-error TS(2339): Property 'getDatabaseStats' does not exist on type... Remove this comment to see the full error message
      const stats = await DatabaseTestUtils.getDatabaseStats();
      console.info('📊 Database Statistics:');
      console.info(`   Total Trucks: ${stats.totalTrucks}`);
      console.info(
        `   With Menus: ${stats.trucksWithMenus} (${((stats.trucksWithMenus / stats.totalTrucks) * 100).toFixed(1)}%)`,
      );
      console.info(
        `   Without Menus: ${stats.trucksWithoutMenus} (${((stats.trucksWithoutMenus / stats.totalTrucks) * 100).toFixed(1)}%)`,
      );
      console.info(`   Recent (24h): ${stats.recentTrucks}`);
      console.info(
        `   Stale (3+ days): ${stats.staleTrucks} (${((stats.staleTrucks / stats.totalTrucks) * 100).toFixed(1)}%)`,
      );

      // Health assertions
      expect(stats.totalTrucks).toBeGreaterThan(0);

      // Alert if too many trucks without menus
      if (stats.trucksWithoutMenus / stats.totalTrucks > 0.4) {
        console.warn('⚠️  Warning: High percentage of trucks without menus');
      }

      // Alert if too many stale trucks
      if (stats.staleTrucks / stats.totalTrucks > 0.6) {
        console.warn('⚠️  Warning: High percentage of stale trucks');
      }

      console.log('✅ Database health check passed');
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      throw error;
    }

    // 2. API Endpoints Health Check
    console.log('\n2. API Endpoints Health Check');
    const endpoints = [
      { path: '/api/test-integration', name: 'Integration Test' },
      { path: '/api/auto-scrape-initiate', name: 'Auto Scrape' },
      { path: '/api/test-pipeline-run', name: 'Pipeline Test' },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await request.get(endpoint.path);
        if (response.ok()) {
          console.log(`✅ ${endpoint.name}: OK`);
        } else {
          console.log(`⚠️  ${endpoint.name}: ${response.status()}`);
        }
      } catch (error) {
        console.error(`❌ ${endpoint.name}: Failed -`, error);
      }
    }

    // 3. Data Quality Check
    console.log('\n3. Data Quality Check');
    try {
      // @ts-expect-error TS(2339): Property 'validateDataQuality' does not exist on t... Remove this comment to see the full error message
      const qualityReport = await DatabaseTestUtils.validateDataQuality();
      console.log(`📋 Data Quality Report:`);
      console.log(`   Valid Trucks: ${qualityReport.validTrucks}`);
      console.log(`   Invalid Trucks: ${qualityReport.invalidTrucks}`);

      if (qualityReport.invalidTrucks > 0) {
        console.log(`   Issues Found: ${qualityReport.issues.length}`);

        // Show sample issues
        const sampleIssues = qualityReport.issues.slice(0, 3);
        for (const issue of sampleIssues) {
          console.log(`   - Truck ${issue.truckId}: ${issue.issues.join(', ')}`);
        }

        if (qualityReport.issues.length > 3) {
          console.log(`   ... and ${qualityReport.issues.length - 3} more issues`);
        }
      }

      const qualityPercentage =
        (qualityReport.validTrucks / (qualityReport.validTrucks + qualityReport.invalidTrucks)) *
        100;
      console.log(`   Quality Score: ${qualityPercentage.toFixed(1)}%`);

      // Quality assertions
      expect(qualityPercentage).toBeGreaterThan(80); // At least 80% quality

      if (qualityPercentage < 90) {
        console.warn('⚠️  Warning: Data quality below 90%');
      } else {
        console.log('✅ Data quality check passed');
      }
    } catch (error) {
      console.error('❌ Data quality check failed:', error);
      throw error;
    }

    // 4. Recent Activity Check
    console.log('\n4. Recent Activity Check');
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: recentActivity, error } = await supabaseAdmin
        .from('food_trucks')
        .select('id, name, created_at, updated_at')
        .or(
          `created_at.gte.${twentyFourHoursAgo.toISOString()},updated_at.gte.${twentyFourHoursAgo.toISOString()}`,
        )
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      console.log(`📈 Recent Activity (24h): ${recentActivity?.length || 0} trucks`);

      if (recentActivity && recentActivity.length > 0) {
        console.log('   Recent updates:');
        for (const truck of recentActivity.slice(0, 5)) {
          const isNew = new Date(truck.created_at) > twentyFourHoursAgo;
          const action = isNew ? 'Created' : 'Updated';
          const time = new Date(isNew ? truck.created_at : truck.updated_at).toLocaleString();
          console.log(`   - ${action}: ${truck.name} (${time})`);
        }
      }

      console.log('✅ Activity check completed');
    } catch (error) {
      console.error('❌ Recent activity check failed:', error);
      throw error;
    }

    console.log('\n=== HEALTH CHECK COMPLETE ===\n');
  });

  test('Performance Baseline Check', async ({
    request
  }: any) => {
    console.log('\n=== PERFORMANCE BASELINE CHECK ===');

    const testUrl = 'https://www.rotirolls.com/';

    // Clean up existing data
    // @ts-expect-error TS(2339): Property 'cleanupTestData' does not exist on type ... Remove this comment to see the full error message
    await DatabaseTestUtils.cleanupTestData({ specificUrls: [testUrl] });

    const startTime = Date.now();

    // Test single pipeline execution
    const response = await request.post('/api/test-pipeline-run', {
      data: { url: testUrl },
    });

    expect(response.ok()).toBeTruthy();

    // Wait for completion
    // @ts-expect-error TS(2339): Property 'waitForProcessingComplete' does not exis... Remove this comment to see the full error message
    const truck = await DatabaseTestUtils.waitForProcessingComplete(testUrl, 300_000, 3000);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(
      `⏱️  Pipeline Processing Time: ${processingTime}ms (${(processingTime / 1000).toFixed(2)}s)`,
    );

    // Performance assertions
    expect(truck).not.toBeNull();
    expect(processingTime).toBeLessThan(5 * 60 * 1000); // Less than 5 minutes

    if (processingTime > 2 * 60 * 1000) {
      console.warn('⚠️  Warning: Processing time above 2 minutes');
    }

    // Validate truck data quality
    if (truck) {
      // @ts-expect-error TS(2339): Property 'validateTruckData' does not exist on typ... Remove this comment to see the full error message
      const issues = DatabaseTestUtils.validateTruckData(truck);
      expect(issues.length).toBe(0);
      console.log('✅ Data quality validation passed');
    }

    console.log('✅ Performance baseline check completed');
    console.log('\n=== BASELINE CHECK COMPLETE ===\n');
  });

  test('Error Rate Monitoring', async ({
    request
  }: any) => {
    console.log('\n=== ERROR RATE MONITORING ===');

    const testRequests = 5;
    const results = [];

    console.log(`Testing ${testRequests} API calls...`);

    for (let i = 0; i < testRequests; i++) {
      try {
        const response = await request.get('/api/auto-scrape-initiate');
        results.push({
          success: response.ok(),
          status: response.status(),
          attempt: i + 1,
        });
      } catch (error) {
        results.push({
          success: false,
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          error: error.message,
          attempt: i + 1,
        });
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const successCount = results.filter((r) => r.success).length;
    const errorRate = ((testRequests - successCount) / testRequests) * 100;

    console.log(`📊 Error Rate Analysis:`);
    console.log(`   Total Requests: ${testRequests}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${testRequests - successCount}`);
    console.log(`   Error Rate: ${errorRate.toFixed(1)}%`);

    // Log individual results
    for (const result of results) {
      const status = result.success ? '✅' : '❌';
      const details = result.success
        ? `(${result.status})`
        : `(${result.error || 'Unknown error'})`;
      console.log(`   ${status} Request ${result.attempt}: ${details}`);
    }

    // Error rate assertions
    expect(errorRate).toBeLessThan(50); // Less than 50% error rate

    if (errorRate > 20) {
      console.warn('⚠️  Warning: Error rate above 20%');
    } else if (errorRate === 0) {
      console.log('✅ Perfect success rate');
    } else {
      console.log('✅ Acceptable error rate');
    }

    console.log('\n=== ERROR RATE MONITORING COMPLETE ===\n');
  });

  test('Resource Utilization Check', async () => {
    console.log('\n=== RESOURCE UTILIZATION CHECK ===');

    try {
      // Monitor resources for 30 seconds
      const monitoringPromise = PipelineTestUtils.monitorResources(30_000);

      // Run some operations during monitoring
      const operationPromises = [];
      for (let i = 0; i < 3; i++) {
        const promise = supabaseAdmin.from('food_trucks').select('id, name, menu').limit(10);
        operationPromises.push(promise);
      }

      await Promise.all([monitoringPromise, ...operationPromises]);

      console.log('✅ Resource monitoring completed');
    } catch (error) {
      console.error('❌ Resource monitoring failed:', error);
      throw error;
    }

    console.log('\n=== RESOURCE UTILIZATION CHECK COMPLETE ===\n');
  });
});

test.describe('Pipeline Alerts and Thresholds', () => {
  test('Critical Thresholds Check', async () => {
    console.log('\n=== CRITICAL THRESHOLDS CHECK ===');

    // @ts-expect-error TS(2339): Property 'getDatabaseStats' does not exist on type... Remove this comment to see the full error message
    const stats = await DatabaseTestUtils.getDatabaseStats();
    const alerts = [];

    // Check critical thresholds
    if (stats.totalTrucks === 0) {
      alerts.push('CRITICAL: No trucks in database');
    }

    if (stats.trucksWithoutMenus / stats.totalTrucks > 0.5) {
      alerts.push(
        `WARNING: ${((stats.trucksWithoutMenus / stats.totalTrucks) * 100).toFixed(1)}% of trucks missing menus`,
      );
    }

    if (stats.staleTrucks / stats.totalTrucks > 0.7) {
      alerts.push(
        `WARNING: ${((stats.staleTrucks / stats.totalTrucks) * 100).toFixed(1)}% of trucks are stale (3+ days)`,
      );
    }

    if (stats.recentTrucks === 0) {
      alerts.push('WARNING: No recent truck activity (24h)');
    }

    // Log alerts
    if (alerts.length > 0) {
      console.log('🚨 ALERTS DETECTED:');
      for (const alert of alerts) {
        console.log(`   ${alert}`);
      }
    } else {
      console.log('✅ All thresholds within acceptable ranges');
    }

    // Don't fail the test for warnings, but fail for critical issues
    const criticalAlerts = alerts.filter((alert) => alert.includes('CRITICAL'));
    expect(criticalAlerts.length).toBe(0);

    console.log('\n=== CRITICAL THRESHOLDS CHECK COMPLETE ===\n');
  });
});
