'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Clock,
  Zap
// @ts-expect-error TS(2792): Cannot find module 'lucide-react'. Did you mean to... Remove this comment to see the full error message
} from 'lucide-react';

interface APIUsage {
  requests: { used: number; limit: number; percentage: number };
  tokens?: { used: number; limit: number; percentage: number };
}

interface APIAlert {
  service: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  usage: { current: number; limit: number; percentage: number };
  timestamp: string;
  recommendations: string[];
}

interface MonitoringData {
  canMakeRequest: boolean;
  alerts: APIAlert[];
  usage: Record<string, APIUsage>;
  recommendations: string[];
}

export function APIMonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitoring/api-usage');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date());
      } else {
        console.error('Failed to fetch monitoring data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMonitoringData, 30_000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 95) return <XCircle className="h-4 w-4 text-red-600" />;
    if (percentage >= 80) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': { return <XCircle className="h-4 w-4 text-red-600" />;
      }
      case 'warning': { return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      }
      default: { return <CheckCircle className="h-4 w-4 text-blue-600" />;
      }
    }
  };

  const getAlertVariant = (level: string): "default" | "destructive" => {
    return level === 'critical' ? 'destructive' : 'default';
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading API monitoring data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load API monitoring data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const criticalAlerts = data.alerts.filter(a => a.level === 'critical');
  const warningAlerts = data.alerts.filter(a => a.level === 'warning');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of external API usage and limits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            // @ts-expect-error TS(2322): Type '{ children: (string | Element)[]; variant: s... Remove this comment to see the full error message
            variant="outline"
            size="sm"
            onClick={fetchMonitoringData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            // @ts-expect-error TS(2322): Type '{ children: (string | Element)[]; variant: s... Remove this comment to see the full error message
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {data.canMakeRequest ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium">API Status</p>
                <p className={`text-lg font-bold ${data.canMakeRequest ? 'text-green-600' : 'text-red-600'}`}>
                  {data.canMakeRequest ? 'Healthy' : 'Limited'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Active Alerts</p>
                <p className="text-lg font-bold">{data.alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Critical</p>
                <p className="text-lg font-bold text-red-600">{criticalAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Last Update</p>
                <p className="text-sm text-gray-600">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Critical API Usage Alerts</AlertTitle>
          <AlertDescription>
            {criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* API Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(data.usage).map(([service, usage]) => (
          <Card key={service}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">{service}</CardTitle>
                {getStatusIcon(usage.requests.percentage)}
              </div>
              <CardDescription>API usage and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Requests */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Requests</span>
                  <span className={getStatusColor(usage.requests.percentage)}>
                    {usage.requests.used.toLocaleString()} / {usage.requests.limit.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={usage.requests.percentage} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {usage.requests.percentage.toFixed(1)}% used
                </p>
              </div>

              {/* Tokens (if applicable) */}
              {usage.tokens && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tokens</span>
                    <span className={getStatusColor(usage.tokens.percentage)}>
                      {usage.tokens.used.toLocaleString()} / {usage.tokens.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={usage.tokens.percentage} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {usage.tokens.percentage.toFixed(1)}% used
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              Current API usage alerts and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.alerts.map((alert, index) => (
              <Alert key={index} variant={getAlertVariant(alert.level)}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.level)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTitle className="text-sm">{alert.message}</AlertTitle>
                      <Badge variant={alert.level === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.level}
                      </Badge>
                    </div>
                    <AlertDescription className="text-xs">
                      Service: {alert.service} | Usage: {alert.usage.percentage.toFixed(1)}%
                    </AlertDescription>
                    {alert.recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">Recommendations:</p>
                        <ul className="text-xs space-y-1">
                          {alert.recommendations.slice(0, 2).map((rec, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Optimization Recommendations
            </CardTitle>
            <CardDescription>
              Suggested actions to optimize API usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-600" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
