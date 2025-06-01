// Task scheduling and automation system
export class TaskScheduler {
  private tasks: Map<string, ScheduledTask>
  private intervals: Map<string, NodeJS.Timeout>
  private isRunning: boolean

  constructor() {
    this.tasks = new Map()
    this.intervals = new Map()
    this.isRunning = false
  }

  start(): void {
    if (this.isRunning) {
      console.log("Scheduler is already running")
      return
    }

    this.isRunning = true
    console.log("Task scheduler started")

    // Start all scheduled tasks
    this.tasks.forEach((task, taskId) => {
      if (task.enabled) {
        this.scheduleTask(taskId, task)
      }
    })
  }

  stop(): void {
    if (!this.isRunning) {
      console.log("Scheduler is not running")
      return
    }

    this.isRunning = false

    // Clear all intervals
    this.intervals.forEach((interval, taskId) => {
      clearInterval(interval)
      console.log(`Stopped task: ${taskId}`)
    })

    this.intervals.clear()
    console.log("Task scheduler stopped")
  }

  addTask(task: ScheduledTask): void {
    this.tasks.set(task.id, task)

    if (this.isRunning && task.enabled) {
      this.scheduleTask(task.id, task)
    }

    console.log(`Added task: ${task.id}`)
  }

  removeTask(taskId: string): void {
    const interval = this.intervals.get(taskId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(taskId)
    }

    this.tasks.delete(taskId)
    console.log(`Removed task: ${taskId}`)
  }

  enableTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.enabled = true

    if (this.isRunning) {
      this.scheduleTask(taskId, task)
    }

    console.log(`Enabled task: ${taskId}`)
  }

  disableTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.enabled = false

    const interval = this.intervals.get(taskId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(taskId)
    }

    console.log(`Disabled task: ${taskId}`)
  }

  private scheduleTask(taskId: string, task: ScheduledTask): void {
    // Clear existing interval if any
    const existingInterval = this.intervals.get(taskId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Calculate interval in milliseconds
    const intervalMs = task.intervalMinutes * 60 * 1000

    // Schedule the task
    const interval = setInterval(async () => {
      try {
        console.log(`Executing task: ${taskId}`)
        task.lastRun = new Date().toISOString()

        await task.execute()

        task.successCount++
        task.lastSuccess = new Date().toISOString()

        console.log(`Task completed successfully: ${taskId}`)
      } catch (error) {
        task.errorCount++
        task.lastError = error instanceof Error ? error.message : "Unknown error"

        console.error(`Task failed: ${taskId}`, error)

        // Disable task if too many consecutive failures
        if (task.errorCount - task.successCount > 5) {
          console.log(`Disabling task due to repeated failures: ${taskId}`)
          this.disableTask(taskId)
        }
      }
    }, intervalMs)

    this.intervals.set(taskId, interval)
    console.log(`Scheduled task: ${taskId} (every ${task.intervalMinutes} minutes)`)
  }

  getTaskStatus(): TaskStatus[] {
    return Array.from(this.tasks.values()).map((task) => ({
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
    }))
  }

  private calculateNextRun(task: ScheduledTask): string | null {
    if (!task.enabled || !task.lastRun) {
      return null
    }

    const lastRun = new Date(task.lastRun)
    const nextRun = new Date(lastRun.getTime() + task.intervalMinutes * 60 * 1000)

    return nextRun.toISOString()
  }
}

interface ScheduledTask {
  id: string
  name: string
  description: string
  intervalMinutes: number
  enabled: boolean
  execute: () => Promise<void>
  lastRun?: string
  lastSuccess?: string
  successCount: number
  errorCount: number
  lastError?: string
}

interface TaskStatus {
  id: string
  name: string
  enabled: boolean
  intervalMinutes: number
  lastRun?: string
  lastSuccess?: string
  successCount: number
  errorCount: number
  lastError?: string
  nextRun?: string | null
}

// Pre-configured tasks for food truck data pipeline
export function createDefaultTasks(
  scraperEngine: any,
  geminiProcessor: any,
  dataQualityAssessor: any,
): ScheduledTask[] {
  return [
    {
      id: "instagram_scrape",
      name: "Instagram Data Scraping",
      description: "Scrape Instagram posts and profiles for food truck data",
      intervalMinutes: 120, // Every 2 hours
      enabled: true,
      successCount: 0,
      errorCount: 0,
      execute: async () => {
        const handles = ["@gourmetstreeteats", "@tacoparadisesf", "@burgermobile"]

        for (const handle of handles) {
          const result = await scraperEngine.scrapeSocialMedia("instagram", handle)
          if (result.success) {
            // Process with Gemini if needed
            console.log(`Successfully scraped ${handle}`)
          } else {
            throw new Error(`Failed to scrape ${handle}: ${result.error}`)
          }
        }
      },
    },
    {
      id: "website_crawl",
      name: "Website Crawling",
      description: "Crawl food truck websites for menu and location updates",
      intervalMinutes: 360, // Every 6 hours
      enabled: true,
      successCount: 0,
      errorCount: 0,
      execute: async () => {
        const websites = ["https://gourmetstreeteats.com", "https://tacoparadise.com", "https://burgermobile.net"]

        const selectors = {
          name: ".truck-name",
          location: ".current-location",
          hours: ".operating-hours",
          menu: ".menu-items",
        }

        for (const url of websites) {
          const result = await scraperEngine.scrapeWebsite(url, selectors)
          if (result.success) {
            console.log(`Successfully crawled ${url}`)
          } else {
            throw new Error(`Failed to crawl ${url}: ${result.error}`)
          }
        }
      },
    },
    {
      id: "data_quality_check",
      name: "Data Quality Assessment",
      description: "Assess and validate data quality for all food trucks",
      intervalMinutes: 720, // Every 12 hours
      enabled: true,
      successCount: 0,
      errorCount: 0,
      execute: async () => {
        // In real implementation, would fetch all trucks from database
        const trucks = [] // Placeholder

        let totalScore = 0
        let processedCount = 0

        for (const truck of trucks) {
          const assessment = dataQualityAssessor.assessTruckData(truck)
          totalScore += assessment.score
          processedCount++

          if (assessment.score < 0.7) {
            console.log(`Low quality data for truck ${truck.id}: ${assessment.issues.join(", ")}`)
          }
        }

        const averageQuality = processedCount > 0 ? totalScore / processedCount : 0
        console.log(`Data quality assessment completed. Average score: ${averageQuality.toFixed(2)}`)
      },
    },
    {
      id: "gemini_processing",
      name: "AI Data Processing",
      description: "Process raw data using Gemini AI for standardization",
      intervalMinutes: 480, // Every 8 hours
      enabled: true,
      successCount: 0,
      errorCount: 0,
      execute: async () => {
        // Check Gemini usage limits
        const usage = geminiProcessor.getUsageStats()

        if (usage.requests.remaining < 100) {
          console.log("Skipping Gemini processing due to rate limits")
          return
        }

        // Process pending data
        const pendingData = [] // In real implementation, fetch from queue

        for (const data of pendingData) {
          if (data.type === "menu") {
            await geminiProcessor.processMenuData(data.content)
          } else if (data.type === "location") {
            await geminiProcessor.extractLocationFromText(data.content)
          } else if (data.type === "hours") {
            await geminiProcessor.standardizeOperatingHours(data.content)
          }
        }

        console.log(`Processed ${pendingData.length} items with Gemini AI`)
      },
    },
    {
      id: "location_update",
      name: "Real-time Location Updates",
      description: "Update current locations for active food trucks",
      intervalMinutes: 30, // Every 30 minutes
      enabled: true,
      successCount: 0,
      errorCount: 0,
      execute: async () => {
        // Get active trucks (those currently operating)
        const activeTrucks = [] // Placeholder

        for (const truck of activeTrucks) {
          // Check social media for location updates
          const socialResult = await scraperEngine.scrapeSocialMedia("instagram", truck.instagram_handle)

          if (socialResult.success) {
            // Extract location from recent posts
            const recentPosts = socialResult.data.posts.slice(0, 3)

            for (const post of recentPosts) {
              if (post.location) {
                // Update truck location
                console.log(`Updated location for ${truck.name}: ${post.location}`)
                break
              }
            }
          }
        }
      },
    },
  ]
}
