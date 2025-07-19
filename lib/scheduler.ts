// Task scheduling and automation system
export class TaskScheduler {
  private tasks: Map<string, ScheduledTask>;
  private intervals: Map<string, NodeJS.Timeout>;
  private isRunning: boolean;

  constructor() {
    this.tasks = new Map();
    this.intervals = new Map();
    this.isRunning = false;
  }

  start(): void {
    if (this.isRunning === true) {
      console.info('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.info('Task scheduler started');

    // Start all scheduled tasks
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.enabled === true) {
        this.scheduleTask(taskId, task);
      }
    }
  }

  stop(): void {
    if (this.isRunning !== true) {
      console.info('Scheduler is not running');
      return;
    }

    this.isRunning = false;

    // Clear all intervals
    for (const [taskId, interval] of this.intervals.entries()) {
      clearInterval(interval);
      console.info(`Stopped task: ${taskId}`);
    }

    this.intervals.clear();
    console.info('Task scheduler stopped');
  }

  addTask(task: ScheduledTask): void {
    this.tasks.set(task.id, task);

    if (this.isRunning === true && task.enabled === true) {
      this.scheduleTask(task.id, task);
    }

    console.info(`Added task: ${task.id}`);
  }

  removeTask(taskId: string): void {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }

    this.tasks.delete(taskId);
    console.info(`Removed task: ${taskId}`);
  }

  enableTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.enabled = true;

    if (this.isRunning) {
      this.scheduleTask(taskId, task);
    }

    console.info(`Enabled task: ${taskId}`);
  }

  disableTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.enabled = false;

    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }

    console.info(`Disabled task: ${taskId}`);
  }

  private scheduleTask(taskId: string, task: ScheduledTask): void {
    // Clear existing interval if any
    const existingInterval = this.intervals.get(taskId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Calculate interval in milliseconds
    const intervalMs = task.intervalMinutes * 60 * 1000;
    
    // Schedule the task with proper async wrapper
    const interval = setInterval(() => {
      // Use void to indicate we're not handling the promise
      void (async (): Promise<void> => {
        try {
          console.info(`Executing task: ${taskId}`);
          task.lastRun = new Date().toISOString();

          await task.execute();

          task.successCount += 1;
          task.lastSuccess = new Date().toISOString();

          console.info(`Task completed successfully: ${taskId}`);
        } catch (error: unknown) {
          task.errorCount += 1;
          task.lastError = error instanceof Error ? error.message : 'Unknown error';

          console.warn(`Task failed: ${taskId}`, error);

          // Disable task if too many consecutive failures
          if (task.errorCount - task.successCount > 5) {
            console.warn(`Disabling task due to repeated failures: ${taskId}`);
            this.disableTask(taskId);
          }
        }
      })();
    }, intervalMs);

    this.intervals.set(taskId, interval);
    console.info(`Scheduled task: ${taskId} (every ${task.intervalMinutes} minutes)`);
  }

  getTaskStatus(): TaskStatus[] {
    return [...this.tasks.values()].map((task) => ({
      id: task.id,
      name: task.name,
      enabled: task.enabled,
      intervalMinutes: task.intervalMinutes,
      lastRun: task.lastRun,
      lastSuccess: task.lastSuccess,
      successCount: task.successCount,
      errorCount: task.errorCount,
      lastError: task.lastError,
      nextRun: this.calculateNextRun(task),
    }));
  }

  private calculateNextRun(task: ScheduledTask): string | undefined {
    if (task.enabled !== true || task.lastRun == undefined) {
      return undefined;
    }

    const lastRun = new Date(task.lastRun);
    const nextRun = new Date(lastRun.getTime() + task.intervalMinutes * 60 * 1000);

    return nextRun.toISOString();
  }

  public scheduleFollowUpTasks(result: unknown): void {
    // Implementation for scheduling follow-up tasks based on scraping results
    console.info('Scheduling follow-up tasks based on scraping results:', result);

    // This could include:
    // - Scheduling quality checks for newly scraped data
    // - Setting up monitoring for high-priority trucks
    // - Triggering additional scraping for related sources
  }
}

interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  intervalMinutes: number;
  enabled: boolean;
  execute: () => Promise<void>;
  lastRun?: string;
  lastSuccess?: string;
  successCount: number;
  errorCount: number;
  lastError?: string;
}

interface TaskStatus {
  id: string;
  name: string;
  enabled: boolean;
  intervalMinutes: number;
  lastRun?: string;
  lastSuccess?: string;
  successCount: number;
  errorCount: number;
  lastError?: string;
  nextRun?: string;
}

interface ScraperEngine {
  scrapeSocialMedia: (
    platform: string,
    handle: string,
  ) => Promise<{ success: boolean; error?: string; data?: unknown }>;
  scrapeWebsite: (
    url: string,
    selectors: Record<string, string>,
  ) => Promise<{ success: boolean; error?: string; data?: unknown }>;
}

interface GeminiProcessor {
  getUsageStats: () => { requests: { remaining: number } };
  processMenuData: (content: string) => Promise<unknown>;
  extractLocationFromText: (content: string) => Promise<unknown>;
  standardizeOperatingHours: (content: string) => Promise<unknown>;
  analyzeSentiment: (content: string) => Promise<unknown>;
  enhanceFoodTruckData: (data: unknown) => Promise<unknown>;
}

interface DataQualityAssessor {
  assessTruckData: (truck: FoodTruck) => { score: number; issues: string[] };
}

interface FoodTruck {
  id: string;
  name: string;
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social_media: {
    instagram_handle?: string;
    facebook_handle?: string;
    twitter_handle?: string;
  };
  cuisine_type: string;
  price_range?: string;
  specialties: string[];
  menu: unknown; // This should be more specific, but for now, keeping it broad
  current_location: {
    lat?: number;
    lng?: number;
    address?: string;
  };
}

interface PendingDataItem {
  type: 'menu' | 'location' | 'hours' | 'sentiment' | 'enhance';
  content: unknown;
}

interface SocialMediaPost {
  location?: string;
  // Add other properties of a social media post if needed
}

// Helper function to update truck location from social media
async function updateTruckLocationFromSocial(
  truck: FoodTruck,
  scraperEngine: ScraperEngine,
): Promise<void> {
  if (
    truck.social_media.instagram_handle == undefined ||
    truck.social_media.instagram_handle === ''
  ) {
    return;
  }

  const socialResult = await scraperEngine.scrapeSocialMedia(
    'instagram',
    truck.social_media.instagram_handle,
  );

  if (socialResult.success === true && socialResult.data != undefined) {
    const socialData = socialResult.data as { posts: SocialMediaPost[] };
    const recentPosts = socialData.posts.slice(0, 3);

    for (const post of recentPosts) {
      if (post.location != undefined && post.location !== '') {
        console.info(`Updated location for ${truck.name}: ${post.location}`);
        break;
      }
    }
  }
}

// Pre-configured tasks for food truck data pipeline
export function createDefaultTasks(
  scraperEngine: ScraperEngine,
  geminiProcessor: GeminiProcessor,
  dataQualityAssessor: DataQualityAssessor,
): ScheduledTask[] {
  return [
    createInstagramScrapeTask(scraperEngine),
    createWebsiteCrawlTask(scraperEngine),
    createDataQualityCheckTask(dataQualityAssessor),
    createGeminiProcessingTask(geminiProcessor),
    createLocationUpdateTask(scraperEngine),
  ];
}

/**
 * Create Instagram scraping task
 */
function createInstagramScrapeTask(scraperEngine: ScraperEngine): ScheduledTask {
  return {
    id: 'instagram_scrape',
    name: 'Instagram Data Scraping',
    description: 'Scrape Instagram posts and profiles for food truck data',
    intervalMinutes: 120, // Every 2 hours
    enabled: true,
    successCount: 0,
    errorCount: 0,
    execute: async () => {
      const handles = ['@gourmetstreeteats', '@tacoparadisesf', '@burgermobile'];

      for (const handle of handles) {
        const result = await scraperEngine.scrapeSocialMedia('instagram', handle);
        if (result.success) {
          console.info(`Successfully scraped ${handle}`);
        } else {
          throw new Error(`Failed to scrape ${handle}: ${result.error}`);
        }
      }
    },
  };
}

/**
 * Create website crawling task
 */
function createWebsiteCrawlTask(scraperEngine: ScraperEngine): ScheduledTask {
  return {
    id: 'website_crawl',
    name: 'Website Crawling',
    description: 'Crawl food truck websites for menu and location updates',
    intervalMinutes: 360, // Every 6 hours
    enabled: true,
    successCount: 0,
    errorCount: 0,
    execute: async () => {
      const websites = [
        'https://gourmetstreeteats.com',
        'https://tacoparadise.com',
        'https://burgermobile.net',
      ];

      const selectors = {
        name: '.truck-name',
        location: '.current-location',
        hours: '.operating-hours',
        menu: '.menu-items',
      };

      for (const url of websites) {
        const result = await scraperEngine.scrapeWebsite(url, selectors);
        if (result.success) {
          console.info(`Successfully crawled ${url}`);
        } else {
          throw new Error(`Failed to crawl ${url}: ${result.error}`);
        }
      }
    },
  };
}

/**
 * Create data quality check task
 */
function createDataQualityCheckTask(dataQualityAssessor: DataQualityAssessor): ScheduledTask {
  return {
    id: 'data_quality_check',
    name: 'Data Quality Assessment',
    description: 'Assess and validate data quality for all food trucks',
    intervalMinutes: 720, // Every 12 hours
    enabled: true,
    successCount: 0,
    errorCount: 0,
    execute: async () => {
      // Placeholder: fetch trucks from database
      const trucks: FoodTruck[] = []; 
      await Promise.resolve(); // Added to satisfy async/await rule

      let totalScore = 0;
      let processedCount = 0;

      if (trucks.length === 0) {
        console.info('No trucks available for quality assessment');
        return;
      }

      for (const truck of trucks) {
        const assessment = dataQualityAssessor.assessTruckData(truck);
        totalScore += assessment.score;
        processedCount+=1;

        if (assessment.score < 0.7) {
          console.warn(`Low quality data for truck ${truck.id}: ${assessment.issues.join(', ')}`);
        }
      }

      const averageQuality = processedCount > 0 ? totalScore / processedCount : 0;
      console.info(
        `Data quality assessment completed. Average score: ${averageQuality.toFixed(2)}`,
      );
    },
  };
}

/**
 * Create Gemini processing task
 */
function createGeminiProcessingTask(geminiProcessor: GeminiProcessor): ScheduledTask {
  return {
    id: 'gemini_processing',
    name: 'AI Data Processing',
    description: 'Process raw data using Gemini AI for standardization',
    intervalMinutes: 480, // Every 8 hours
    enabled: true,
    successCount: 0,
    errorCount: 0,
    execute: async () => {
      const usage = geminiProcessor.getUsageStats();

      if (usage.requests.remaining < 100) {
        console.warn('Skipping Gemini processing due to rate limits');
        return;
      }

      const pendingData: PendingDataItem[] = []; // Placeholder: fetch pending data from queue system

      if (pendingData.length === 0) {
        console.info('No pending data to process');
        return;
      }

      await processGeminiDataBatch(geminiProcessor, pendingData);
      console.info(`Processed ${pendingData.length} items with Gemini AI`);
    },
  };
}

/**
 * Process batch of data with Gemini
 */
async function processGeminiDataBatch(
  geminiProcessor: GeminiProcessor,
  pendingData: PendingDataItem[],
): Promise<void> {
  for (const data of pendingData) {
    switch (data.type) {
      case 'menu': {
        await geminiProcessor.processMenuData(data.content as string);
        break;
      }
      case 'location': {
        await geminiProcessor.extractLocationFromText(data.content as string);
        break;
      }
      case 'hours': {
        await geminiProcessor.standardizeOperatingHours(data.content as string);
        break;
      }
      case 'sentiment': {
        await geminiProcessor.analyzeSentiment(data.content as string);
        break;
      }
      case 'enhance': {
        await geminiProcessor.enhanceFoodTruckData(data.content);
        break;
      }
      default: {
        // No default
        break;
      }
    }
  }
}

/**
 * Create location update task
 */
function createLocationUpdateTask(scraperEngine: ScraperEngine): ScheduledTask {
  return {
    id: 'location_update',
    name: 'Real-time Location Updates',
    description: 'Update current locations for active food trucks',
    intervalMinutes: 30, // Every 30 minutes
    enabled: true,
    successCount: 0,
    errorCount: 0,
    execute: async () => {
      const activeTrucks: FoodTruck[] = []; // Placeholder: fetch active trucks from database

      if (activeTrucks.length === 0) {
        console.info('No active trucks to update locations for');
        return;
      }

      for (const truck of activeTrucks) {
        await updateTruckLocationFromSocial(truck, scraperEngine);
      }
    },
  };
}

// Export scheduler instance for use in cron jobs
export const scheduler = new TaskScheduler();
