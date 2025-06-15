import React from 'react';
import { DataCleanupDashboard } from '@/components/admin/DataCleanupDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// @ts-expect-error TS(2792): Cannot find module 'lucide-react'. Did you mean to... Remove this comment to see the full error message
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
        <Shield className="h-4 w-4 mr-1" />
        SOTA Quality System
      </Badge>
    </div>
  );
}

// Helper component for feature overview cards
function FeatureOverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Duplicate Prevention</CardTitle>
          <Merge className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">85%+</div>
          <p className="text-xs text-muted-foreground">
            Similarity detection with intelligent merging
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Automated Cleanup</CardTitle>
          <RefreshCw className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">5 Types</div>
          <p className="text-xs text-muted-foreground">
            Placeholder removal, phone normalization, coordinate fixes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quality Scoring</CardTitle>
          <Zap className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Real-time</div>
          <p className="text-xs text-muted-foreground">
            Automatic quality score recalculation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Batch Processing</CardTitle>
          <Shield className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">Safe</div>
          <p className="text-xs text-muted-foreground">
            Dry run mode with comprehensive error handling
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for system features
function SystemFeatures() {
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
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Duplicate Prevention</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Merge className="h-3 w-3 text-purple-600" />
                Advanced similarity detection (85%+ accuracy)
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-green-600" />
                Multi-field matching (name, location, contact)
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-blue-600" />
                Intelligent merging with data preservation
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 text-yellow-600" />
                Real-time duplicate checking in pipeline
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Automated Cleanup</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 text-red-600" />
                Placeholder and mock data removal
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-blue-600" />
                Phone number normalization
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-green-600" />
                GPS coordinate validation and correction
              </li>
              <li className="flex items-center gap-2">
                <Merge className="h-3 w-3 text-purple-600" />
                Quality score recalculation
              </li>
            </ul>
          </div>
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
              <li>1. Always run a <strong>Preview</strong> first to see estimated changes</li>
              <li>2. Use <strong>Dry Run</strong> mode to test operations without making changes</li>
              <li>3. Review the operations you want to run - deselect any you don't need</li>
              <li>4. Consider running operations individually for better control</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Recommended Schedule:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• <strong>Daily:</strong> Quality score updates and placeholder removal</li>
              <li>• <strong>Weekly:</strong> Phone normalization and coordinate fixes</li>
              <li>• <strong>Monthly:</strong> Full duplicate detection and merging</li>
              <li>• <strong>As needed:</strong> Manual duplicate resolution</li>
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
