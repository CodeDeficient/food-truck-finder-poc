import React from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

type Status = 'healthy' | 'warning' | 'error' | 'unknown';

/**
 * Returns CSS class string based on the given status.
 * @example
 * status('warning')
 * 'text-yellow-600 bg-yellow-50 border-yellow-200'
 * @param {Status} status - The status to determine the CSS class string.
 * @returns {string} CSS class string corresponding to the status.
 * @description
 *   - Handles default case by returning gray-themed CSS classes.
 */
export const getStatusColor = (status: Status): string => {
  switch (status) {
    case 'healthy': {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    case 'warning': {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    case 'error': {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    default: {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
};

 
/**
* Renders a React component based on the provided status.
* @example
* renderStatusIcon('healthy')
* Returns a React component with a green check circle icon.
* @param {string} status - The status string representing the condition.
* @returns {React.ReactNode} A React component corresponding to the given status.
* @description
*   - The 'healthy', 'warning', and 'error' statuses map to specific icons and colors.
*   - Uses default case to render a clock icon for unsupported status values.
*   - Icons are styled with a uniform class size-4.
*   - Utilizes icon components from a library like FontAwesome or similar.
*/
export const getStatusIcon = (status: Status): React.ReactNode => {
  switch (status) {
    case 'healthy': {
      return <CheckCircle className="size-4 text-green-600" />;
    }
    case 'warning': {
      return <AlertTriangle className="size-4 text-yellow-600" />;
    }
    case 'error': {
      return <AlertTriangle className="size-4 text-red-600" />;
    }
    default: {
      return <Clock className="size-4 text-gray-600" />;
    }
  }
};

 
/**
 * Returns a trending icon based on the provided trend string.
 * @example
 * getTrendIcon('up')
 * // Returns a TrendingUp icon component
 * @param {string} trend - The trend direction which can be 'up' or 'down'.
 * @returns {React.ReactNode} The icon corresponding to the trend direction or undefined if the trend is not recognized.
 * @description
 *   - Icons are styled with a specific class for size and color according to the trend.
 *   - Returns undefined explicitly when the trend is neither 'up' nor 'down'.
 *   - Utilizes `TrendingUp` and `TrendingDown` components for icon display.
 */
export const getTrendIcon = (trend?: string): React.ReactNode => {
  switch (trend) {
    case 'up': {
      return <TrendingUp className="size-3 text-green-600" />;
    }
    case 'down': {
      return <TrendingDown className="size-3 text-red-600" />;
    }
    default: {
      return undefined; // Explicitly return undefined when no icon is needed
    }
  }
};
