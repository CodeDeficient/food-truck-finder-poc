#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Test the actual scraping job service
async function testScrapingService() {
  console.log('🔍 Testing ScrapingJobService directly...');
  
  try {
    // Import the service after dotenv is loaded
    const { ScrapingJobService } = await import('./dist/lib/supabase/services/scrapingJobService.js');
    
    console.log('\n📋 Testing getJobsByStatus("pending")...');
    const pendingJobs = await ScrapingJobService.getJobsByStatus('pending');
    console.log(`✅ Found ${pendingJobs.length} pending jobs via service`);
    
    if (pendingJobs.length > 0) {
      pendingJobs.slice(0, 3).forEach(job => {
        console.log(`  - ${job.id}: ${job.status} - ${job.target_url}`);
      });
    }
    
    console.log('\n📋 Testing getJobsByStatus("all")...');
    const allJobs = await ScrapingJobService.getJobsByStatus('all');
    console.log(`✅ Found ${allJobs.length} total jobs via service`);
    
    const statusCounts = {};
    allJobs.forEach(job => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });
    
    console.log('\n📊 Status counts via service:');
    Object.keys(statusCounts).forEach(status => {
      console.log(`  - ${status}: ${statusCounts[status]}`);
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

testScrapingService();
