import { type NextRequest, NextResponse } from "next/server"
import { FoodTruckService } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const cuisine = searchParams.get("cuisine")
  const openNow = searchParams.get("openNow") === "true"
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const radius = searchParams.get("radius") || "10"

  try {
    let trucks = []

    // Get trucks by location if coordinates provided
    if (lat && lng) {
      const userLat = Number.parseFloat(lat)
      const userLng = Number.parseFloat(lng)
      const radiusKm = Number.parseFloat(radius)
      trucks = await FoodTruckService.getTrucksByLocation(userLat, userLng, radiusKm)
    } else {
      // Get all trucks
      const result = await FoodTruckService.getAllTrucks(100, 0)
      trucks = result.trucks
    }

    // Apply filters
    let filteredTrucks = trucks

    // Text search filter
    if (query) {
      filteredTrucks = filteredTrucks.filter(
        (truck) =>
          truck.name.toLowerCase().includes(query.toLowerCase()) ||
          truck.description?.toLowerCase().includes(query.toLowerCase()) ||
          truck.menu?.some((category: any) =>
            category.items?.some(
              (item: any) =>
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase()),
            ),
          ),
      )
    }

    // Cuisine filter
    if (cuisine) {
      filteredTrucks = filteredTrucks.filter((truck) =>
        truck.menu?.some((category: any) => category.category.toLowerCase().includes(cuisine.toLowerCase())),
      )
    }

    // Open now filter
    if (openNow) {
      const now = new Date()
      const currentDay = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][now.getDay()]
      const currentTime = now.getHours() * 100 + now.getMinutes()

      filteredTrucks = filteredTrucks.filter((truck) => {
        const hours = truck.operating_hours?.[currentDay]
        if (!hours || hours.closed) return false

        const openTime = Number.parseInt(hours.open.replace(":", ""))
        const closeTime = Number.parseInt(hours.close.replace(":", ""))
        return currentTime >= openTime && currentTime <= closeTime
      })
    }

    // Sort by data quality score
    filteredTrucks.sort((a, b) => (b.data_quality_score || 0) - (a.data_quality_score || 0))

    return NextResponse.json({
      trucks: filteredTrucks,
      total: filteredTrucks.length,
      filters: {
        query,
        cuisine,
        openNow,
        location: lat && lng ? { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) } : null,
        radius: Number.parseFloat(radius),
      },
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
