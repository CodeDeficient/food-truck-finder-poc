import { type NextRequest, NextResponse } from "next/server"
import { gemini } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: "Type and data are required" }, { status: 400 })
    }

    // Check usage limits
    const usageCheck = await gemini.checkUsageLimits()
    if (!usageCheck.canMakeRequest) {
      return NextResponse.json(
        {
          error: "Daily API limits exceeded",
          usage: usageCheck.usage,
        },
        { status: 429 },
      )
    }

    let result
    switch (type) {
      case "menu":
        result = await gemini.processMenuData(data)
        break
      case "location":
        result = await gemini.extractLocationFromText(data)
        break
      case "hours":
        result = await gemini.standardizeOperatingHours(data)
        break
      case "sentiment":
        result = await gemini.analyzeSentiment(data)
        break
      case "enhance":
        result = await gemini.enhanceFoodTruckData(data)
        break
      default:
        return NextResponse.json({ error: "Invalid processing type" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    if (action === "usage") {
      const usageCheck = await gemini.checkUsageLimits()
      const stats = await gemini.getUsageStats()

      return NextResponse.json({
        canMakeRequest: usageCheck.canMakeRequest,
        usage: usageCheck.usage,
        todayStats: stats,
      })
    }

    return NextResponse.json({
      message: "Gemini API",
      endpoints: ["POST /api/gemini - Process data with Gemini", "GET /api/gemini?action=usage - Get usage statistics"],
    })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
