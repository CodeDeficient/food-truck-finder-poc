"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Star, ExternalLink } from "lucide-react"

interface TruckCardProps {
  truck: {
    id: string
    name: string
    description: string
    current_location?: {
      address: string
    }
    operating_hours?: Record<string, { open: string; close: string; closed: boolean }>
    contact_info?: {
      phone?: string
      website?: string
    }
    data_quality_score: number
    verification_status: string
    menu?: Array<{
      category: string
      items: Array<{ name: string; price: number }>
    }>
  }
  isOpen?: boolean
  distance?: number
  onSelect?: () => void
}

export function TruckCard({ truck, isOpen, distance, onSelect }: TruckCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getPopularItems = () => {
    if (!truck.menu || truck.menu.length === 0) return []
    return truck.menu[0]?.items?.slice(0, 3) || []
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{truck.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {truck.current_location?.address || "Location not available"}
              {distance && <span className="ml-2">• {distance.toFixed(1)} km away</span>}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Open" : "Closed"}</Badge>
            <Badge variant="outline" className="text-xs">
              {Math.round(truck.data_quality_score * 100)}% Quality
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-2">{truck.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-sm">Popular Items</h4>
            <div className="space-y-1">
              {getPopularItems().map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  <span className="text-green-600 ml-2">{formatPrice(item.price)}</span>
                </div>
              ))}
              {getPopularItems().length === 0 && <p className="text-gray-500 text-sm">Menu not available</p>}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Contact</h4>
            <div className="space-y-1">
              {truck.contact_info?.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-3 w-3 mr-1" />
                  <span className="truncate">{truck.contact_info.phone}</span>
                </div>
              )}
              {truck.contact_info?.website && (
                <div className="flex items-center text-sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="truncate">Website</span>
                </div>
              )}
              <div className="flex items-center text-xs text-gray-500">
                <Star className="h-3 w-3 mr-1" />
                <span>{truck.verification_status}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
