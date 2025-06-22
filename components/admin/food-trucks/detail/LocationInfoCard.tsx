import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface LocationInfoCardProps {
  truck: { current_location?: { address?: string; lat?: number; lng?: number; timestamp?: string } };
}

export function LocationInfoCard({ truck }: LocationInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Information
        </CardTitle>
        <CardDescription>Current location and address details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(truck.current_location?.address === undefined) ? (
          <p className="text-gray-400 text-sm">No address available</p>
        ) : (
          <div>
            <label className="text-sm font-medium text-gray-500">Address</label>
            <p className="text-gray-900">{truck.current_location.address}</p>
          </div>
        )}

        {truck.current_location?.lat !== undefined && truck.current_location?.lng !== undefined && (
          <div>
            <label className="text-sm font-medium text-gray-500">Coordinates</label>
            <p className="text-gray-900 font-mono text-sm">
              {truck.current_location.lat.toFixed(6)}, {truck.current_location.lng.toFixed(6)}
            </p>
          </div>
        )}

        {truck.current_location?.timestamp != undefined && (
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="text-gray-900">
              {new Date(truck.current_location.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
