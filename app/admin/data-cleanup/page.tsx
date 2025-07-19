
import { DataCleanupDashboard } from '@/components/admin/DataCleanupDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, RefreshCw, Merge } from 'lucide-react';

// Helper component for page header
/**
 * Creates the page header for the Data Cleanup & Quality Management section.
 * @example
 * PageHeader()
 * <div className="flex items-center justify-between">...</div>
 * @returns {JSX.Element} A React component rendering the header section.
 * @description
 *   - Utilizes CSS classes for styling and layout, ensuring consistency.
 *   - Displays a title and description along with a badge indicating system status.
 *   - Integrates an icon within the badge for visual emphasis.
 */
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
/**
* Renders a feature card with a title, icon, value, description, and custom color styling.
* @example
* FeatureCard({
*   title: "Total Users",
*   icon: <UserIcon />,
*   value: "1,024",
*   description: "Number of active users",
*   colorClass: "text-green-500"
* })
* @param {Object} params - The parameter object.
* @param {string} params.title - The title displayed on the card.
* @param {React.ReactNode} params.icon - The icon displayed alongside the title.
* @param {string} params.value - The main value displayed in the card.
* @param {string} params.description - A brief description underneath the value.
* @param {string} params.colorClass - The CSS class for styling the value text.
* @returns {JSX.Element} The JSX element rendering the feature card.
* @description
*   - The card consists of a header and a content section.
*   - `colorClass` defines the text color of the `value` for visual emphasis.
*/
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
/**
 * Renders a set of feature overview cards.
 * @example
 * FeatureOverviewCards()
 * Returns JSX for rendering feature cards in a grid layout.
 * @returns {JSX.Element} A grid containing four FeatureCard components, each with specific properties.
 * @description
 *   - Utilizes a responsive grid layout with different column counts for different screen sizes.
 *   - Each 'FeatureCard' component is assigned specific props such as title, icon, value, description, and colorClass.
 *   - Icons are rendered with specific size and color classes for stylistic consistency.
 *   - Represents a high-level overview of different features with distinctive functionalities via descriptive cards.
 */
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
/**
 * Renders a list of features with icons and descriptions.
 * @example
 * FeatureList({ title: 'Features', items: [{ icon: <Icon />, text: 'Feature 1' }] })
 * <div className="space-y-3">...</div>
 * @param {Object} {title, items} - An object containing feature list title and array of items.
 * @param {string} title - The title of the feature list.
 * @param {Array<{icon: React.ReactNode, text: string}>} items - Array of items with icon and text.
 * @returns {JSX.Element} A styled and structured list of features.
 * @description
 *   - Utilizes Tailwind CSS classes for styling.
 *   - Maps through the items to display each feature with an icon.
 *   - Ensures each list item has a unique key using its index.
 */
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
/**
 * SystemFeatures component showcases data quality system features.
 * @example
 * SystemFeatures()
 * <Card>...</Card>
 * @returns {JSX.Element} A JSX element displaying data quality features.
 * @description
 *   - The component divides features into 'Duplicate Prevention' and 'Automated Cleanup' categories.
 *   - Each feature is accompanied by an icon and a text description.
 *   - Utilizes react components for displaying features in a card format.
 *   - Leverages grid layout to organize features responsively.
 */
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
/**
 * Renders a card component that describes advanced algorithms and safety measures for data quality management.
 * @example
 * TechnicalImplementation()
 * <Card>...</Card>
 * @returns {JSX.Element} A card component containing detailed sections about duplicate detection algorithms, cleanup operations, and safety features.
 * @description
 *   - Integrates methods for validating and normalizing data to ensure high quality standards.
 *   - Provides algorithmic descriptions aimed at improving data safety and management.
 *   - Utilizes multi-threshold alerting and confidence scoring for accuracy.
 *   - Supports dry run modes and error handling to secure operations.
 */
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
/**
* Displays best practices and guidelines for optimal data quality management
* @example
* UsageGuidelines()
* Returns a structured card with recommendations and safety considerations for data cleanup operations.
* @returns {JSX.Element} Returns a JSX card element with sections on preparation, recommended schedules, and safety considerations.
* @description
*   - The function provides a structured layout for integrating best practices into a UI component.
*   - Contains detailed guidelines on the use of preview and dry run modes for data cleanup operations.
*   - Offers scheduling recommendations to maintain data hygiene efficiently.
*   - Highlights safety considerations to prevent irreversible operations.
*/
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
