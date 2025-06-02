"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Phone, Search, Navigation, Moon, Sun } from "lucide-react"
import { useThemeSwitcher } from "@/components/theme-provider"
import dynamic from 'next/dynamic'

const MapDisplay = dynamic(() => import('@/components/map-display'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg"><p>Loading map...</p></div>,
})

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
  const { theme, setTheme, resolvedTheme } = useThemeSwitcher()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Finding delicious food trucks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🚚 Food Truck Finder</h1>
              <p className="text-gray-600 dark:text-gray-400">Discover amazing food trucks near you</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:space-x-4"> {/* Added flex-wrap, justify-end, gap-2. Removed space-x-4 for sm screens */}
              <div className="flex items-center space-x-2 order-1 sm:order-none"> {/* Control order for small screens if needed */}
                {mounted && (resolvedTheme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-500" />)}
                <Switch
                  id="theme-switcher"
                  checked={mounted && resolvedTheme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Switch between dark and light mode"
                  disabled={!mounted}
                />
                <Label htmlFor="theme-switcher" className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                  {mounted && (resolvedTheme === "dark" ? "Light Mode" : "Dark Mode")}
                </Label>
              </div>
              <div className="relative order-3 sm:order-none w-full sm:w-64"> {/* Full width on small, fixed on sm+ */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search food trucks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full bg-white dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400" // w-full for responsiveness
                />
              </div>
              <Button onClick={loadNearbyTrucks} disabled={!userLocation} variant="outline" className="order-2 sm:order-none"> {/* Control order */}
                <Navigation className="h-4 w-4 mr-2" />
                Find Nearby
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold dark:text-gray-100">Current Target Food Truck Source</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The primary data source for food truck information is currently:
            </p>
            <a
              href="https://eatrotirolls.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              https://eatrotirolls.com/
            </a>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Real Map */}
              <div className="lg:col-span-2 h-80 min-h-[320px] sm:h-96 sm:min-h-[400px] dark:bg-slate-800 rounded-lg shadow">
                <MapDisplay trucks={filteredTrucks} userLocation={userLocation} />
              </div>

              {/* Truck List Sidebar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-gray-100">Nearby Trucks ({filteredTrucks.length})</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredTrucks.map((truck) => (
                    <Card
                      key={truck.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTruck?.id === truck.id ? "ring-2 ring-blue-500 dark:ring-blue-400" : "hover:bg-gray-50 dark:hover:bg-slate-700"
                      } dark:bg-slate-800 dark:border-slate-700`}
                      onClick={() => setSelectedTruck(truck)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium dark:text-gray-100">{truck.name}</h4>
                          <Badge variant={isOpen(truck) ? "default" : "secondary"}>
                            {isOpen(truck) ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{truck.description}</p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
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
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl dark:text-gray-100">{selectedTruck.name}</CardTitle>
                      <CardDescription className="dark:text-gray-400">{selectedTruck.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isOpen(selectedTruck) ? "default" : "secondary"}>
                        {isOpen(selectedTruck) ? "Open Now" : "Closed"}
                      </Badge>
                      <Badge variant="outline" className="dark:text-gray-300 dark:border-slate-600">Quality: {Math.round(selectedTruck.data_quality_score * 100)}%</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Contact & Hours */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center dark:text-gray-100">
                        <Clock className="h-4 w-4 mr-2" />
                        Hours & Contact
                      </h4>
                      <div className="space-y-2 text-sm dark:text-gray-300">
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
                      <h4 className="font-medium mb-3 dark:text-gray-100">Menu</h4>
                      <div className="space-y-4">
                        {selectedTruck.menu?.map((category, idx) => (
                          <div key={idx}>
                            <h5 className="font-medium text-gray-900 dark:text-gray-200 mb-2">{category.category}</h5>
                            <div className="space-y-2">
                              {category.items?.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium dark:text-gray-100">{item.name}</span>
                                      {item.dietary_tags?.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs dark:text-gray-300 dark:border-slate-600">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                  </div>
                                  <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(item.price)}</span>
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
                <Card key={truck.id} className="dark:bg-slate-800 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg dark:text-gray-100">{truck.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-1" />
                          {truck.current_location?.address || "Location not available"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isOpen(truck) ? "default" : "secondary"}>
                          {isOpen(truck) ? "Open" : "Closed"}
                        </Badge>
                        <Badge variant="outline" className="dark:text-gray-300 dark:border-slate-600">{Math.round(truck.data_quality_score * 100)}% Quality</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{truck.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 dark:text-gray-100">Popular Items</h4>
                        <div className="space-y-1 dark:text-gray-300">
                          {truck.menu?.slice(0, 1).map((category) =>
                            category.items?.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="dark:text-gray-200">{item.name}</span>
                                <span className="text-green-600 dark:text-green-400">{formatPrice(item.price)}</span>
                              </div>
                            )),
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 dark:text-gray-100">Today's Hours</h4>
                        <div className="text-sm dark:text-gray-300">
                          {(() => {
                            const today = getCurrentDay()
                            const hours = truck.operating_hours?.[today]
                            return hours?.closed ? "Closed today" : `${hours?.open} - ${hours?.close}`
                          })()}
                        </div>
                        {truck.contact_info?.phone && (
                          <div className="flex items-center mt-2 text-sm dark:text-gray-300">
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
  const [loadingAdmin, setLoadingAdmin] = useState(true) // Renamed to avoid conflict
  const { resolvedTheme: adminTheme } = useThemeSwitcher() // Use resolvedTheme for admin section too
  const [adminMounted, setAdminMounted] = useState(false)

  useEffect(() => {
    setAdminMounted(true)
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

  if (loadingAdmin) {
    return <div className={`text-center py-8 ${adminMounted && adminTheme === 'dark' ? 'text-gray-300' : ''}`}>Loading admin dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-300">Total Trucks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">{dashboardData?.overview?.totalTrucks || 0}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-300">Active Scrapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">{dashboardData?.scraping?.running || 0}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-300">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">{(dashboardData?.scraping?.successRate || 0).toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-300">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">
              {((dashboardData?.quality?.avg_quality_score || 0) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">API Usage Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                  <span>Gemini Requests</span>
                  <span>
                    {dashboardData?.usage?.gemini?.requests?.used || 0} /
                    {dashboardData?.usage?.gemini?.requests?.limit || 1500}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                    style={{ width: `${dashboardData?.usage?.gemini?.requests?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                  <span>Gemini Tokens</span>
                  <span>
                    {dashboardData?.usage?.gemini?.tokens?.used || 0} /
                    {dashboardData?.usage?.gemini?.tokens?.limit || 32000}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                    style={{ width: `${dashboardData?.usage?.gemini?.tokens?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.scraping?.recentJobs?.slice(0, 5).map((job: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium dark:text-gray-200">{job.job_type || "Scraping job"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {job.completed_at ? new Date(job.completed_at).toLocaleString() : "Recently"}
                    </p>
                  </div>
                  <Badge variant={job.status === "completed" ? "default" : "secondary"}>{job.status}</Badge>
                </div>
              )) || <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
