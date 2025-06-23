import React from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

// Move SystemAlert type definition here
export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

// Helper function for status colors
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': { return 'text-green-600 bg-green-50 border-green-200';
    }
    case 'warning': { return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    case 'error': { return 'text-red-600 bg-red-50 border-red-200';
    }
    default: { return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
};

// Helper function for status icons
export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': { return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    case 'warning': { return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    case 'error': { return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    default: { return <Clock className="h-4 w-4 text-gray-600" />;
    }
  }
};

// Helper function for trend icons
export const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'up': { return <TrendingUp className="h-3 w-3 text-green-600" />;
    }
    case 'down': { return <TrendingDown className="h-3 w-3 text-red-600" />;
    }
    default: { return null;
    }
  }
};

// Helper function for alert classes
export function getAlertClasses(alertType: SystemAlert['type'], acknowledged?: boolean) {
  let classes = '';
  if (alertType === 'critical') classes = 'border-l-red-500 bg-red-50';
  else if (alertType === 'error') classes = 'border-l-red-400 bg-red-50';
  else classes = 'border-l-yellow-400 bg-yellow-50';

  if (acknowledged === true) classes += ' opacity-50';
  return classes;
}
