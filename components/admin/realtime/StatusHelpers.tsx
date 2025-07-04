import React from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

type Status = 'healthy' | 'warning' | 'error' | 'unknown';

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

// eslint-disable-next-line sonarjs/function-return-type
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

// eslint-disable-next-line sonarjs/function-return-type
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
