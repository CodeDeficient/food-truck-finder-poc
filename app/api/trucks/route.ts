import { type NextRequest, NextResponse } from "next/server"
import { FoodTruckService } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const radius = searchParams.get("radius") || "5"
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  try {
    // Get specific truck by ID
    if (id) {
      const truck = await FoodTruckService.getTruckById(id)
      return NextResponse.json({ truck })
    }

    // Get trucks by location
    if (lat && lng) {
      const userLat = Number.parseFloat(lat)
      const userLng = Number.parseFloat(lng)
      const radiusKm = Number.parseFloat(radius)

      const nearbyTrucks = await FoodTruckService.getTrucksByLocation(userLat, userLng, radiusKm)

      return NextResponse.json({
        trucks: nearbyTrucks,
        total: nearbyTrucks.length,
        limit,
        offset,
        hasMore: false, // Location-based queries don't use pagination
      })
    }

    // Get all trucks with pagination
    const { trucks, total } = await FoodTruckService.getAllTrucks(limit, offset)

    return NextResponse.json({
      trucks,
      total,
      limit,
      offset,
      hasMore: offset + limit < (total || 0),
      summary: {
        totalTrucks: total,
        averageQuality: trucks.reduce((acc, t) => acc + (t.data_quality_score || 0), 0) / trucks.length,
        lastUpdated: Math.max(...trucks.map((t) => new Date(t.updated_at).getTime())),
      },
    })
  } catch (error) {
    console.error("Error fetching food trucks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "current_location", "contact_info"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new food truck
    const truckData = {
      name: body.name,
      description: body.description,
      current_location: body.current_location,
      scheduled_locations: body.scheduled_locations || [],
      operating_hours: body.operating_hours || {},
      menu: body.menu || [],
      contact_info: body.contact_info,
      social_media: body.social_media || {},
      source_urls: body.source_urls || [],
      data_quality_score: 0.5, // Initial score
      verification_status: "pending",
    }

    const newTruck = await FoodTruckService.createTruck(truckData)

    return NextResponse.json(
      {
        message: "Food truck created successfully",
        truck: newTruck,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating food truck:", error)
    return NextResponse.json({ error: "Failed to create food truck" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Truck ID is required" }, { status: 400 })
    }

    const updatedTruck = await FoodTruckService.updateTruck(id, updates)

    return NextResponse.json({
      message: "Food truck updated successfully",
      truck: updatedTruck,
    })
  } catch (error) {
    console.error("Error updating food truck:", error)
    return NextResponse.json({ error: "Failed to update food truck" }, { status: 500 })
  }
}
