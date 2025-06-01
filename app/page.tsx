"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Phone, Search, Navigation } from "lucide-react"

interface FoodTruck {
  id: string
  name: string
  description: string
  current_location: {
    lat: number
    lng: number
    address: string
    timestamp: string
  }
  operating_hours: Record<string, { open: string; close: string; closed: boolean }>
  menu: Array<{
    category: string
    items: Array<{
      name: string
      description: string
      price: number
      dietary_tags: string[]
    }>
  }>
  contact_info: {
    phone?: string
    email?: string
    website?: string
  }
  social_media: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  data_quality_score: number
  verification_status: string
  distance?: number
}

export default function FoodTruckFinder() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedTruck, setSelectedTruck] = useState<FoodTruck | null>(null)
  const [activeTab, setActiveTab] = useState("map")

  useEffect(() => {
    loadFoodTrucks()
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied:", error)
          // Default to San Francisco
          setUserLocation({ lat: 37.7749, lng: -122.4194 })
        },
      )
    } else {
      // Default to San Francisco
      setUserLocation({ lat: 37.7749, lng: -122.4194 })
    }
  }

  const loadFoodTrucks = async () => {
    try {
      const response = await fetch("/api/trucks")
      const data = await response.json()
      setTrucks(data.trucks || [])
    } catch (error) {
      console.error("Failed to load food trucks:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadNearbyTrucks = async () => {
    if (!userLocation) return

    try {
      const response = await fetch(`/api/trucks?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10`)
      const data = await response.json()
      setTrucks(data.trucks || [])
    } catch (error) {
      console.error("Failed to load nearby trucks:", error)
    }
  }

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCurrentDay = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[new Date().getDay()]
  }

  const isOpen = (truck: FoodTruck) => {
    const today = getCurrentDay()
    const hours = truck.operating_hours?.[today]
    if (!hours || hours.closed) return false

    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const openTime = Number.parseInt(hours.open.replace(":", ""))
    const closeTime = Number.parseInt(hours.close.replace(":", ""))

    return currentTime >= openTime && currentTime <= closeTime
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding delicious food trucks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🚚 Food Truck Finder</h1>
              <p className="text-gray-600">Discover amazing food trucks near you</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search food trucks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={loadNearbyTrucks} disabled={!userLocation}>
                <Navigation className="h-4 w-4 mr-2" />
                Find Nearby
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Placeholder */}
              <div className="lg:col-span-2">
                <Card className="h-96">
                  <CardContent className="p-6 h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Interactive Map</h3>
                      <p className="text-gray-500">Map integration would show truck locations here</p>
                      <div className="mt-4 text-sm text-gray-400">
                        {userLocation && (
                          <p>
                            Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Truck List Sidebar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Nearby Trucks ({filteredTrucks.length})</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredTrucks.map((truck) => (
                    <Card
                      key={truck.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTruck?.id === truck.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedTruck(truck)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{truck.name}</h4>
                          <Badge variant={isOpen(truck) ? "default" : "secondary"}>
                            {isOpen(truck) ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{truck.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {truck.current_location?.address || "Location not available"}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Truck Details */}
            {selectedTruck && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{selectedTruck.name}</CardTitle>
                      <CardDescription>{selectedTruck.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isOpen(selectedTruck) ? "default" : "secondary"}>
                        {isOpen(selectedTruck) ? "Open Now" : "Closed"}
                      </Badge>
                      <Badge variant="outline">Quality: {Math.round(selectedTruck.data_quality_score * 100)}%</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Contact & Hours */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Hours & Contact
                      </h4>
                      <div className="space-y-2 text-sm">
                        {selectedTruck.operating_hours &&
                          Object.entries(selectedTruck.operating_hours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}:</span>
                              <span>{hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}</span>
                            </div>
                          ))}
                        {selectedTruck.contact_info?.phone && (
                          <div className="flex items-center mt-3">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{selectedTruck.contact_info.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="md:col-span-2">
                      <h4 className="font-medium mb-3">Menu</h4>
                      <div className="space-y-4">
                        {selectedTruck.menu?.map((category, idx) => (
                          <div key={idx}>
                            <h5 className="font-medium text-gray-900 mb-2">{category.category}</h5>
                            <div className="space-y-2">
                              {category.items?.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{item.name}</span>
                                      {item.dietary_tags?.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                  </div>
                                  <span className="font-medium text-green-600">{formatPrice(item.price)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <div className="grid gap-6">
              {filteredTrucks.map((truck) => (
                <Card key={truck.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{truck.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {truck.current_location?.address || "Location not available"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isOpen(truck) ? "default" : "secondary"}>
                          {isOpen(truck) ? "Open" : "Closed"}
                        </Badge>
                        <Badge variant="outline">{Math.round(truck.data_quality_score * 100)}% Quality</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{truck.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Popular Items</h4>
                        <div className="space-y-1">
                          {truck.menu?.slice(0, 1).map((category) =>
                            category.items?.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="text-green-600">{formatPrice(item.price)}</span>
                              </div>
                            )),
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Today's Hours</h4>
                        <div className="text-sm">
                          {(() => {
                            const today = getCurrentDay()
                            const hours = truck.operating_hours?.[today]
                            return hours?.closed ? "Closed today" : `${hours?.open} - ${hours?.close}`
                          })()}
                        </div>
                        {truck.contact_info?.phone && (
                          <div className="flex items-center mt-2 text-sm">
                            <Phone className="h-4 w-4 mr-1" />
                            {truck.contact_info.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading admin dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.overview?.totalTrucks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Scrapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.scraping?.running || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData?.scraping?.successRate || 0).toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((dashboardData?.quality?.avg_quality_score || 0) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Usage Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Gemini Requests</span>
                  <span>
                    {dashboardData?.usage?.gemini?.requests?.used || 0} /
                    {dashboardData?.usage?.gemini?.requests?.limit || 1500}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${dashboardData?.usage?.gemini?.requests?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Gemini Tokens</span>
                  <span>
                    {dashboardData?.usage?.gemini?.tokens?.used || 0} /
                    {dashboardData?.usage?.gemini?.tokens?.limit || 32000}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${dashboardData?.usage?.gemini?.tokens?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.scraping?.recentJobs?.slice(0, 5).map((job: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{job.job_type || "Scraping job"}</p>
                    <p className="text-xs text-gray-500">
                      {job.completed_at ? new Date(job.completed_at).toLocaleString() : "Recently"}
                    </p>
                  </div>
                  <Badge variant={job.status === "completed" ? "default" : "secondary"}>{job.status}</Badge>
                </div>
              )) || <p className="text-gray-500 text-center py-4">No recent activity</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
