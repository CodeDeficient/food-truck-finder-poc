'use client';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Trash2, Phone, MapPin, Star, Merge } from 'lucide-react';

export { operationConfig };

interface OperationSelectorProps {
  readonly selectedOperations: string[];
  readonly onToggleOperation: (operation: string) => void;
}

const operationConfig = {
  remove_placeholders: {
    name: 'Remove Placeholders',
    description: 'Remove placeholder and mock data values',
    icon: <Trash2 className="size-4" />,
    color: 'text-red-600',
  },
  normalize_phone: {
    name: 'Normalize Phone Numbers',
    description: 'Format phone numbers consistently',
    icon: <Phone className="size-4" />,
    color: 'text-blue-600',
  },
  fix_coordinates: {
    name: 'Fix GPS Coordinates',
    description: 'Correct invalid location coordinates',
    icon: <MapPin className="size-4" />,
    color: 'text-green-600',
  },
  update_quality_scores: {
    name: 'Update Quality Scores',
    description: 'Recalculate data quality scores',
    icon: <Star className="size-4" />,
    color: 'text-yellow-600',
  },
  merge_duplicates: {
    name: 'Merge Duplicates',
    description: 'Identify and merge duplicate entries',
    icon: <Merge className="size-4" />,
    color: 'text-purple-600',
  },
};

/**
 * Renders a set of selectable cleanup operations for the admin panel.
 * @example
 * OperationSelector({ selectedOperations: ['delete_unused'], onToggleOperation: toggleOperation })
 * <Card>...</Card>
 * @param {Object} {selectedOperations, onToggleOperation} - An object with two properties:
 * - selectedOperations: An array of strings representing the currently selected operations.
 * - onToggleOperation: A callback function that handles the toggling of an operation's selection state.
 * @returns {JSX.Element} A card component containing the list of cleanup operations to display.
 * @description
 *   - Utilizes `Object.entries` to iterate through an operation configuration object.
 *   - Applies dynamic styles to indicate selected operations.
 *   - The operation items toggle their appearance and selection state on click.
 */
export function OperationSelector({
  selectedOperations,
  onToggleOperation,
}: Readonly<OperationSelectorProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cleanup Operations</CardTitle>
        <CardDescription>Select which cleanup operations to run</CardDescription>
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
              <div className={config.color}>{config.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{config.name}</div>
                <div className="text-xs text-muted-foreground">{config.description}</div>
              </div>
              {selectedOperations.includes(key) && (
                <CheckCircle className="size-4 text-blue-600" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
