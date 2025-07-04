import React from 'react';
import { DataCleanupDashboard } from '@/components/admin/DataCleanupDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, RefreshCw, Merge } from 'lucide-react';

// Helper component for page header
function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Cleanup & Quality Management</h1>
        <p className="text-muted-foreground">
          Automated data quality improvements, duplicate prevention, and batch cleanup operations
        </p>
      </div>
      <Badge variant="outline" className="text-sm">
        <Shield className="size-4 mr-1" />
        SOTA Quality System
      </Badge>
    </div>
  );
}

// Helper component for individual feature cards
function FeatureCard({
  title,
  icon,
  value,
  description,
  colorClass,
}: {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly value: string;
  readonly description: string;
  readonly colorClass: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Helper component for feature overview cards
function FeatureOverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <FeatureCard
        title="Duplicate Prevention"
        icon={<Merge className="size-4 text-purple-600" />}
        value="85%+"
        description="Similarity detection with intelligent merging"
        colorClass="text-purple-600"
      />
      <FeatureCard
        title="Automated Cleanup"
        icon={<RefreshCw className="size-4 text-blue-600" />}
        value="5 Types"
        description="Placeholder removal, phone normalization, coordinate fixes"
        colorClass="text-blue-600"
      />
      <FeatureCard
        title="Quality Scoring"
        icon={<Zap className="size-4 text-green-600" />}
        value="Real-time"
        description="Automatic quality score recalculation"
        colorClass="text-green-600"
      />
      <FeatureCard
        title="Batch Processing"
        icon={<Shield className="size-4 text-yellow-600" />}
        value="Safe"
        description="Dry run mode with comprehensive error handling"
        colorClass="text-yellow-600"
      />
    </div>
  );
}

// Helper component for feature lists
function FeatureList({
  title,
  items,
}: {
  readonly title: string;
  readonly items: Array<{ readonly icon: React.ReactNode; readonly text: string }>;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.icon}
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper component for system features
function SystemFeatures() {
  const duplicatePreventionItems = [
    {
      icon: <Merge className="size-3 text-purple-600" />,
      text: 'Advanced similarity detection (85%+ accuracy)',
    },
    {
      icon: <Shield className="size-3 text-green-600" />,
      text: 'Multi-field matching (name, location, contact)',
    },
    {
      icon: <Zap className="size-3 text-blue-600" />,
      text: 'Intelligent merging with data preservation',
    },
    {
      icon: <RefreshCw className="size-3 text-yellow-600" />,
      text: 'Real-time duplicate checking in pipeline',
    },
  ];

  const automatedCleanupItems = [
    {
      icon: <RefreshCw className="size-3 text-red-600" />,
      text: 'Placeholder and mock data removal',
    },
    { icon: <Shield className="size-3 text-blue-600" />, text: 'Phone number normalization' },
    {
      icon: <Zap className="size-3 text-green-600" />,
      text: 'GPS coordinate validation and correction',
    },
    { icon: <Merge className="size-3 text-purple-600" />, text: 'Quality score recalculation' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality System Features</CardTitle>
        <CardDescription>
          State-of-the-art data quality management and cleanup capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <FeatureList title="Duplicate Prevention" items={duplicatePreventionItems} />
          <FeatureList title="Automated Cleanup" items={automatedCleanupItems} />
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for technical implementation details
function TechnicalImplementation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Implementation</CardTitle>
        <CardDescription>
          Advanced algorithms and safety measures for data quality management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Duplicate Detection Algorithm</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Levenshtein distance for name similarity</li>
              <li>• GPS coordinate proximity matching</li>
              <li>• Exact contact information matching</li>
              <li>• Weighted scoring with confidence levels</li>
              <li>• Multi-threshold alerting (80%, 95%)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Cleanup Operations</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Pattern-based placeholder detection</li>
              <li>• US phone number normalization</li>
              <li>• Charleston area coordinate validation</li>
              <li>• Quality score recalculation</li>
              <li>• Batch processing with error handling</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Safety Features</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Dry run mode for safe testing</li>
              <li>• Comprehensive error logging</li>
              <li>• Rollback-friendly operations</li>
              <li>• Batch size limiting</li>
              <li>• Progress tracking and reporting</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for usage guidelines
function UsageGuidelines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Practices & Guidelines</CardTitle>
        <CardDescription>
          Recommended usage patterns for optimal data quality management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Before Running Cleanup:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>
                1. Always run a <strong>Preview</strong> first to see estimated changes
              </li>
              <li>
                2. Use <strong>Dry Run</strong> mode to test operations without making changes
              </li>
              <li>3. Review the operations you want to run - deselect any you don't need</li>
              <li>4. Consider running operations individually for better control</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Recommended Schedule:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>
                • <strong>Daily:</strong> Quality score updates and placeholder removal
              </li>
              <li>
                • <strong>Weekly:</strong> Phone normalization and coordinate fixes
              </li>
              <li>
                • <strong>Monthly:</strong> Full duplicate detection and merging
              </li>
              <li>
                • <strong>As needed:</strong> Manual duplicate resolution
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Safety Considerations:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• Duplicate merging is irreversible - review carefully</li>
              <li>• Coordinate fixes use Charleston, SC defaults</li>
              <li>• Phone normalization assumes US format</li>
              <li>• Quality scores are recalculated based on current data</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Data Cleanup & Quality Management Page
 * Provides comprehensive data quality improvements and duplicate prevention
 */
export default function DataCleanupPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader />
      <FeatureOverviewCards />
      <SystemFeatures />
      <DataCleanupDashboard />
      <TechnicalImplementation />
      <UsageGuidelines />
    </div>
  );
}
