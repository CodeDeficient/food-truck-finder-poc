'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Trash2, Phone, MapPin, Star, Merge } from 'lucide-react';

export { operationConfig };

interface OperationSelectorProps {
  selectedOperations: string[];
  onToggleOperation: (operation: string) => void;
}

const operationConfig = {
  remove_placeholders: {
    name: 'Remove Placeholders',
    description: 'Remove placeholder and mock data values',
    icon: <Trash2 className="h-4 w-4" />,
    color: 'text-red-600'
  },
  normalize_phone: {
    name: 'Normalize Phone Numbers',
    description: 'Format phone numbers consistently',
    icon: <Phone className="h-4 w-4" />,
    color: 'text-blue-600'
  },
  fix_coordinates: {
    name: 'Fix GPS Coordinates',
    description: 'Correct invalid location coordinates',
    icon: <MapPin className="h-4 w-4" />,
    color: 'text-green-600'
  },
  update_quality_scores: {
    name: 'Update Quality Scores',
    description: 'Recalculate data quality scores',
    icon: <Star className="h-4 w-4" />,
    color: 'text-yellow-600'
  },
  merge_duplicates: {
    name: 'Merge Duplicates',
    description: 'Identify and merge duplicate entries',
    icon: <Merge className="h-4 w-4" />,
    color: 'text-purple-600'
  }
};

export function OperationSelector({ selectedOperations, onToggleOperation }: OperationSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cleanup Operations</CardTitle>
        <CardDescription>
          Select which cleanup operations to run
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(operationConfig).map(([key, config]) => (
            <div
              key={key}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedOperations.includes(key)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onToggleOperation(key)}
            >
              <div className={config.color}>
                {config.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{config.name}</div>
                <div className="text-xs text-muted-foreground">{config.description}</div>
              </div>
              {selectedOperations.includes(key) && (
                <CheckCircle className="h-4 w-4 text-blue-600" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
