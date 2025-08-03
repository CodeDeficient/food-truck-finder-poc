'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Edit,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { type FoodTruck } from '@/lib/supabase';
import {
  formatQualityScore,
  categorizeQualityScore,
  getQualityBadgeClasses,
  getQualityScoreAriaLabel,
  type QualityCategory,
} from '@/lib/utils/QualityScorer';

// Types
interface DataQualityStats {
  total_trucks: number;
  avg_quality_score: number;
  high_quality_count: number;
  medium_quality_count: number;
  low_quality_count: number;
  verified_count: number;
  pending_count: number;
  flagged_count: number;
}

interface DataQualityDashboardProps {
  initialTrucks: FoodTruck[];
  qualityStats: DataQualityStats;
}

interface TrendData {
  date: string;
  score: number;
  total_trucks: number;
}

// Color scheme for charts
const QUALITY_COLORS = {
  high: '#22c55e',
  medium: '#f59e0b',
  low: '#ef4444',
  primary: '#3b82f6',
  secondary: '#6b7280',
};

// KPI Card Component
function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: { value: number; isPositive: boolean };
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
            {trend && (
              <div className="flex items-center mt-2">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground ml-1">vs last 30d</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quality Score Trend Chart
function QualityTrendChart({ data }: { data: TrendData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Score Trend (30 Days)</CardTitle>
        <CardDescription>Average data quality score over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Quality Score']}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={QUALITY_COLORS.primary} 
              strokeWidth={2}
              dot={{ fill: QUALITY_COLORS.primary }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Quality Distribution Chart
function QualityDistributionChart({ stats }: { stats: DataQualityStats }) {
  const data = [
    { name: 'High Quality', value: stats.high_quality_count, color: QUALITY_COLORS.high },
    { name: 'Medium Quality', value: stats.medium_quality_count, color: QUALITY_COLORS.medium },
    { name: 'Low Quality', value: stats.low_quality_count, color: QUALITY_COLORS.low },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Distribution</CardTitle>
        <CardDescription>Breakdown by quality categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Verification Status Chart
function VerificationStatusChart({ stats }: { stats: DataQualityStats }) {
  const data = [
    { name: 'Verified', count: stats.verified_count },
    { name: 'Pending', count: stats.pending_count },
    { name: 'Flagged', count: stats.flagged_count },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
        <CardDescription>Current verification status distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={QUALITY_COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Data Grid with filters
function DataQualityGrid({ 
  trucks, 
  onExportCSV 
}: { 
  trucks: FoodTruck[], 
  onExportCSV: () => void 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('data_quality_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedTrucks = useMemo(() => {
    let filtered = trucks.filter((truck) => {
      const matchesSearch = truck.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || truck.verification_status === statusFilter;
      const matchesQuality = qualityFilter === 'all' || (() => {
        const category = categorizeQualityScore(truck.data_quality_score ?? 0);
        return category.level === qualityFilter;
      })();

      return matchesSearch && matchesStatus && matchesQuality;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'data_quality_score':
          aValue = a.data_quality_score ?? 0;
          bValue = b.data_quality_score ?? 0;
          break;
        case 'verification_status':
          aValue = a.verification_status;
          bValue = b.verification_status;
          break;
        case 'last_scraped_at':
          aValue = a.last_scraped_at ? new Date(a.last_scraped_at).getTime() : 0;
          bValue = b.last_scraped_at ? new Date(b.last_scraped_at).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [trucks, searchTerm, statusFilter, qualityFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Failing Records & Data Quality Issues</span>
          <Button onClick={onExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardTitle>
        <CardDescription>
          Review and manage individual food truck data quality. Click on any truck to view details and fix issues.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search food trucks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
          <Select value={qualityFilter} onValueChange={setQualityFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quality</SelectItem>
              <SelectItem value="high">High Quality</SelectItem>
              <SelectItem value="medium">Medium Quality</SelectItem>
              <SelectItem value="low">Low Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedTrucks.length} of {trucks.length} records
          </p>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('verification_status')}
                >
                  Status {sortField === 'verification_status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('data_quality_score')}
                >
                  Quality Score {sortField === 'data_quality_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Quality Category</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('last_scraped_at')}
                >
                  Last Updated {sortField === 'last_scraped_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTrucks.map((truck) => {
                const qualityCategory: QualityCategory = categorizeQualityScore(truck.data_quality_score ?? 0);
                const badgeClasses: string = getQualityBadgeClasses(truck.data_quality_score ?? 0);
                const ariaLabel: string = getQualityScoreAriaLabel(truck.data_quality_score ?? 0);

                return (
                  <TableRow key={truck.id}>
                    <TableCell className="font-medium">{truck.name}</TableCell>
                    <TableCell>
                      <Badge variant={truck.verification_status === 'verified' ? 'default' : 'outline'}>
                        {truck.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span aria-label={ariaLabel}>
                        {formatQualityScore(truck.data_quality_score)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={badgeClasses}>
                        {qualityCategory.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {truck.last_scraped_at 
                        ? new Date(truck.last_scraped_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/food-trucks/${truck.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Fix
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// CSV Export utility
function exportToCSV(trucks: FoodTruck[]) {
  const headers = [
    'ID',
    'Name',
    'Quality Score',
    'Quality Category',
    'Verification Status',
    'Last Updated',
    'Cuisine Type',
    'State',
    'Phone',
    'Email',
    'Website',
  ];

  const csvContent = [
    headers.join(','),
    ...trucks.map((truck) => {
      const qualityCategory = categorizeQualityScore(truck.data_quality_score ?? 0);
      return [
        truck.id,
        `"${truck.name}"`,
        truck.data_quality_score ?? 0,
        qualityCategory.label,
        truck.verification_status,
        truck.last_scraped_at ? new Date(truck.last_scraped_at).toISOString() : '',
        `"${truck.cuisine_type?.join(', ') ?? ''}"`,
        truck.state ?? '',
        truck.phone_number ?? '',
        truck.email ?? '',
        truck.website ?? '',
      ].join(',');
    }),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data-quality-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Slack Alert Configuration Component
function SlackAlertConfig() {
  const [alertThreshold, setAlertThreshold] = useState(70);
  const [isEnabled, setIsEnabled] = useState(false);

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/admin/data-quality/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'configure',
          threshold: alertThreshold,
          enabled: isEnabled,
        }),
      });

      if (response.ok) {
        alert('Slack alert configuration saved successfully!');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving Slack configuration:', error);
      alert('Failed to save Slack alert configuration');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Slack Alert Configuration
        </CardTitle>
        <CardDescription>
          Configure automatic Slack notifications when data quality drops below threshold
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="slack-enabled"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="slack-enabled" className="text-sm font-medium">
            Enable Slack alerts
          </label>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Alert Threshold (%)</label>
          <Input
            type="number"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            min={0}
            max={100}
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">
            Alert when overall quality score drops below this threshold
          </p>
        </div>

        <Button onClick={handleSaveConfig} size="sm">
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export function DataQualityDashboard({ 
  initialTrucks, 
  qualityStats 
}: DataQualityDashboardProps) {
  const [trucks] = useState<FoodTruck[]>(initialTrucks);

  // Generate mock trend data (in a real app, this would come from the API)
  const trendData: TrendData[] = useMemo(() => {
    const data: TrendData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Mock trend data with some variation
      const baseScore = qualityStats.avg_quality_score * 100;
      const variation = (Math.random() - 0.5) * 10;
      const score = Math.max(0, Math.min(100, baseScore + variation));
      
      data.push({
        date: date.toISOString().split('T')[0],
        score,
        total_trucks: qualityStats.total_trucks + Math.floor((Math.random() - 0.5) * 20),
      });
    }
    
    return data;
  }, [qualityStats]);

  // Calculate trend for KPI cards
  const qualityTrend = useMemo(() => {
    if (trendData.length < 2) return undefined;
    
    const currentScore = trendData[trendData.length - 1]?.score ?? 0;
    const previousScore = trendData[trendData.length - 8]?.score ?? 0; // 7 days ago
    const change = ((currentScore - previousScore) / previousScore) * 100;
    
    return {
      value: Math.abs(change),
      isPositive: change > 0,
    };
  }, [trendData]);

  const handleExportCSV = () => {
    exportToCSV(trucks);
  };

  const handleRefresh = async () => {
    // Implement refresh logic
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Quality Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/data-quality/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Overall Quality Score"
          value={`${(qualityStats.avg_quality_score * 100).toFixed(1)}%`}
          subtitle={`Based on ${qualityStats.total_trucks} trucks`}
          trend={qualityTrend}
          icon={BarChart3}
          color={qualityStats.avg_quality_score >= 0.8 ? 'green' : qualityStats.avg_quality_score >= 0.6 ? 'yellow' : 'red'}
        />
        <KPICard
          title="High Quality Trucks"
          value={qualityStats.high_quality_count}
          subtitle={`${((qualityStats.high_quality_count / qualityStats.total_trucks) * 100).toFixed(1)}% of total`}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Issues Requiring Attention"
          value={qualityStats.low_quality_count + qualityStats.flagged_count}
          subtitle="Low quality + flagged trucks"
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Pending Verification"
          value={qualityStats.pending_count}
          subtitle="Awaiting manual review"
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <QualityTrendChart data={trendData} />
        </div>
        <QualityDistributionChart stats={qualityStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VerificationStatusChart stats={qualityStats} />
        <SlackAlertConfig />
      </div>

      {/* Data Grid */}
      <DataQualityGrid trucks={trucks} onExportCSV={handleExportCSV} />
    </div>
  );
}
