import React from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { StatusMetric } from './useSystemMetrics';

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

export const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'up': { return <TrendingUp className="h-3 w-3 text-green-600" />;
    }
    case 'down': { return <TrendingDown className="h-3 w-3 text-red-600" />;
    }
    default: { return;
    }
  }
};
