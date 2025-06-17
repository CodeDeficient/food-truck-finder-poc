import React from 'react';
import { APIMonitoringDashboard } from '@/components/monitoring/ApiMonitoringDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, Zap, TrendingUp } from 'lucide-react';

/**
 * API Monitoring Page
 * Provides comprehensive real-time monitoring of all external API usage
 */
export default function MonitoringPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Monitoring & Alerting</h1>
          <p className="text-muted-foreground">
            Real-time monitoring, alerting, and optimization for external API usage
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Activity className="h-4 w-4 mr-1" />
          Live Monitoring
        </Badge>
      </div>

      {/* Feature Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proactive Monitoring</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Real-time</div>
            <p className="text-xs text-muted-foreground">
              Live API usage tracking with 30-second refresh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Alerting</CardTitle>
            <Shield className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">80% / 95%</div>
            <p className="text-xs text-muted-foreground">
              Warning / Critical thresholds with recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Throttling</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Enabled</div>
            <p className="text-xs text-muted-foreground">
              Prevents quota exceeded errors automatically
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">SOTA</div>
            <p className="text-xs text-muted-foreground">
              AI-powered usage optimization recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Features</CardTitle>
          <CardDescription>
            State-of-the-art API monitoring and alerting capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Proactive Monitoring</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-blue-600" />
                  Real-time usage tracking for all APIs
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-green-600" />
                  Predictive limit checking before requests
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  Automatic throttling to prevent quota exceeded
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                  Historical usage trends and analytics
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Smart Alerting</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-orange-600" />
                  Multi-level alerts (Warning 80%, Critical 95%)
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-red-600" />
                  Service-specific recommendations
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-blue-600" />
                  Optimization suggestions for high usage
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  Wait time calculations for rate limit resets
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Monitoring Dashboard */}
      <APIMonitoringDashboard />

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>
            Advanced monitoring system built with SOTA practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Monitored APIs</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Gemini AI (1,500 req/day, 32K tokens)</li>
                <li>• Firecrawl (500 req/day)</li>
                <li>• Tavily Search (1,000 req/day)</li>
                <li>• Supabase (50K req/day)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Alert Thresholds</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Warning: 80% usage</li>
                <li>• Critical: 95% usage</li>
                <li>• Auto-throttling: 95%+</li>
                <li>• Rate limit reset tracking</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Optimization Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Request queuing recommendations</li>
                <li>• Caching strategy suggestions</li>
                <li>• Token usage optimization</li>
                <li>• Batch processing guidance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
