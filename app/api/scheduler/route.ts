import { type NextRequest, NextResponse } from "next/server"

// Mock scheduler instance and tasks
let schedulerInstance: any = null
const schedulerTasks: any[] = [
  {
    id: "instagram_scrape",
    name: "Instagram Data Scraping",
    enabled: true,
    intervalMinutes: 120,
    lastRun: new Date(Date.now() - 1800000).toISOString(),
    lastSuccess: new Date(Date.now() - 1800000).toISOString(),
    successCount: 45,
    errorCount: 3,
    nextRun: new Date(Date.now() + 5400000).toISOString(),
  },
  {
    id: "website_crawl",
    name: "Website Crawling",
    enabled: true,
    intervalMinutes: 360,
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    lastSuccess: new Date(Date.now() - 7200000).toISOString(),
    successCount: 23,
    errorCount: 1,
    nextRun: new Date(Date.now() + 14400000).toISOString(),
  },
  {
    id: "data_quality_check",
    name: "Data Quality Assessment",
    enabled: true,
    intervalMinutes: 720,
    lastRun: new Date(Date.now() - 21600000).toISOString(),
    lastSuccess: new Date(Date.now() - 21600000).toISOString(),
    successCount: 12,
    errorCount: 0,
    nextRun: new Date(Date.now() + 21600000).toISOString(),
  },
  {
    id: "gemini_processing",
    name: "AI Data Processing",
    enabled: false,
    intervalMinutes: 480,
    lastRun: new Date(Date.now() - 28800000).toISOString(),
    lastSuccess: new Date(Date.now() - 28800000).toISOString(),
    successCount: 8,
    errorCount: 2,
    lastError: "Rate limit exceeded",
    nextRun: null,
  },
  {
    id: "location_update",
    name: "Real-time Location Updates",
    enabled: true,
    intervalMinutes: 30,
    lastRun: new Date(Date.now() - 900000).toISOString(),
    lastSuccess: new Date(Date.now() - 900000).toISOString(),
    successCount: 156,
    errorCount: 8,
    nextRun: new Date(Date.now() + 900000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "status":
        return NextResponse.json({
          isRunning: schedulerInstance !== null,
          tasks: schedulerTasks,
          summary: {
            totalTasks: schedulerTasks.length,
            enabledTasks: schedulerTasks.filter((t) => t.enabled).length,
            runningTasks: schedulerTasks.filter((t) => t.enabled && t.nextRun).length,
            totalSuccesses: schedulerTasks.reduce((acc, t) => acc + t.successCount, 0),
            totalErrors: schedulerTasks.reduce((acc, t) => acc + t.errorCount, 0),
          },
        })

      case "logs":
        // Return recent task execution logs
        return NextResponse.json({
          logs: [
            {
              timestamp: new Date(Date.now() - 300000).toISOString(),
              taskId: "location_update",
              level: "info",
              message: "Successfully updated locations for 12 food trucks",
            },
            {
              timestamp: new Date(Date.now() - 900000).toISOString(),
              taskId: "instagram_scrape",
              level: "info",
              message: "Scraped 3 Instagram accounts, found 8 new posts",
            },
            {
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              taskId: "gemini_processing",
              level: "error",
              message: "Rate limit exceeded, skipping AI processing",
            },
            {
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              taskId: "website_crawl",
              level: "warning",
              message: "Failed to crawl tacoparadise.com - site temporarily unavailable",
            },
          ],
        })

      default:
        return NextResponse.json({
          message: "Task Scheduler API",
          endpoints: [
            "GET /api/scheduler?action=status - Get scheduler status",
            "GET /api/scheduler?action=logs - Get execution logs",
            "POST /api/scheduler - Start/stop scheduler or execute task",
            "PUT /api/scheduler - Update task configuration",
          ],
        })
    }
  } catch (error) {
    console.error("Scheduler API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, taskId } = body

    switch (action) {
      case "start":
        if (schedulerInstance) {
          return NextResponse.json({ error: "Scheduler is already running" }, { status: 409 })
        }

        schedulerInstance = { started: new Date().toISOString() }

        return NextResponse.json({
          message: "Scheduler started successfully",
          status: "running",
        })

      case "stop":
        if (!schedulerInstance) {
          return NextResponse.json({ error: "Scheduler is not running" }, { status: 409 })
        }

        schedulerInstance = null

        return NextResponse.json({
          message: "Scheduler stopped successfully",
          status: "stopped",
        })

      case "execute":
        if (!taskId) {
          return NextResponse.json({ error: "Task ID is required for execution" }, { status: 400 })
        }

        const task = schedulerTasks.find((t) => t.id === taskId)
        if (!task) {
          return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        // Simulate task execution
        task.lastRun = new Date().toISOString()

        // Simulate success/failure
        if (Math.random() > 0.1) {
          // 90% success rate
          task.lastSuccess = task.lastRun
          task.successCount++
          task.lastError = undefined
        } else {
          task.errorCount++
          task.lastError = "Simulated execution error"
        }

        return NextResponse.json({
          message: `Task ${taskId} executed`,
          task: task,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in scheduler POST:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, config } = body

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const taskIndex = schedulerTasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Update task configuration
    schedulerTasks[taskIndex] = {
      ...schedulerTasks[taskIndex],
      ...config,
    }

    // Update next run time if interval changed
    if (config.intervalMinutes && schedulerTasks[taskIndex].enabled) {
      const lastRun = new Date(schedulerTasks[taskIndex].lastRun || Date.now())
      const nextRun = new Date(lastRun.getTime() + config.intervalMinutes * 60 * 1000)
      schedulerTasks[taskIndex].nextRun = nextRun.toISOString()
    }

    return NextResponse.json({
      message: "Task configuration updated",
      task: schedulerTasks[taskIndex],
    })
  } catch (error) {
    console.error("Error updating task configuration:", error)
    return NextResponse.json({ error: "Failed to update task configuration" }, { status: 500 })
  }
}
