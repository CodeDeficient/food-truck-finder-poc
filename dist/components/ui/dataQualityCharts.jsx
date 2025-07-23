'use client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// SOTA color scheme for data quality categories
export const QUALITY_COLORS = [
    '#22c55e', // Green for high quality (≥80%)
    '#f59e0b', // Amber for medium quality (60-79%)
    '#ef4444', // Red for low quality (<60%)
];
import CustomTooltip from './chart/CustomTooltip';
// Quality Distribution Pie Chart Component
/**
 * Renders a pie chart displaying the quality distribution of food trucks.
 * @example
 * renderQualityDistribution({ high_quality_count: 20, medium_quality_count: 30, low_quality_count: 10, total_trucks: 60 })
 * // Returns a JSX element with a pie chart.
 * @param {Object} qualityStats - An object containing statistics of food truck data quality.
 * @param {number} qualityStats.high_quality_count - Count of high-quality trucks.
 * @param {number} qualityStats.medium_quality_count - Count of medium-quality trucks.
 * @param {number} qualityStats.low_quality_count - Count of low-quality trucks.
 * @param {number} qualityStats.total_trucks - Total number of trucks.
 * @returns {JSX.Element} JSX element representing the pie chart for quality distribution.
 * @description
 *   - Utilizes the 'ResponsiveContainer', 'PieChart', 'Pie', and 'Tooltip' components for visualization.
 *   - Uses 'QUALITY_COLORS' for the custom colors of the pie chart slices.
 *   - Displays tooltips and labels with percentage data for each section.
 */
const QualityDistributionChart = ({ qualityStats, }) => {
    const data = [
        {
            name: 'High Quality',
            value: qualityStats.high_quality_count,
            percentage: ((qualityStats.high_quality_count / qualityStats.total_trucks) * 100).toFixed(1),
        },
        {
            name: 'Medium Quality',
            value: qualityStats.medium_quality_count,
            percentage: ((qualityStats.medium_quality_count / qualityStats.total_trucks) * 100).toFixed(1),
        },
        {
            name: 'Low Quality',
            value: qualityStats.low_quality_count,
            percentage: ((qualityStats.low_quality_count / qualityStats.total_trucks) * 100).toFixed(1),
        },
    ];
    return (<Card>
      <CardHeader>
        <CardTitle>Quality Distribution</CardTitle>
        <CardDescription>Breakdown of food trucks by data quality categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }) => `${name ?? 'Unknown'}: ${percentage ?? '0'}%`} outerRadius={80} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={QUALITY_COLORS[index % QUALITY_COLORS.length]}/>))}
            </Pie>
            <Tooltip content={<CustomTooltip />}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>);
};
// Verification Status Bar Chart Component
/**
 * Renders a card component displaying a bar chart of verification status statistics.
 * @example
 * renderVerificationStatusCard({ verified_count: 10, pending_count: 5, flagged_count: 2, total_trucks: 20 })
 * <Card>...</Card>
 * @param {Object} qualityStats - An object containing verification statistics.
 * @param {number} qualityStats.verified_count - The count of verified trucks.
 * @param {number} qualityStats.pending_count - The count of trucks pending verification.
 * @param {number} qualityStats.flagged_count - The count of flagged trucks.
 * @param {number} qualityStats.total_trucks - The total number of trucks.
 * @returns {JSX.Element} Returns a JSX Card element displaying the bar chart.
 * @description
 *   - Calculates the percentage of each verification status to the total number of trucks.
 *   - Utilizes the Recharts library to render a responsive bar chart.
 */
const VerificationStatusChart = ({ qualityStats, }) => {
    const data = [
        {
            name: 'Verified',
            count: qualityStats.verified_count,
            percentage: ((qualityStats.verified_count / qualityStats.total_trucks) * 100).toFixed(1),
        },
        {
            name: 'Pending',
            count: qualityStats.pending_count,
            percentage: ((qualityStats.pending_count / qualityStats.total_trucks) * 100).toFixed(1),
        },
        {
            name: 'Flagged',
            count: qualityStats.flagged_count,
            percentage: ((qualityStats.flagged_count / qualityStats.total_trucks) * 100).toFixed(1),
        },
    ];
    return (<Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
        <CardDescription>Current verification status of all food trucks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="name"/>
            <YAxis />
            <Tooltip content={<CustomTooltip />}/>
            <Bar dataKey="count" fill="#3b82f6"/>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>);
};
// Helper function to get score color
const getScoreColor = (score) => {
    if (score >= 0.8)
        return 'text-green-600';
    if (score >= 0.6)
        return 'text-yellow-600';
    return 'text-red-600';
};
// Helper function to get quality threshold label
const getQualityThreshold = (score) => {
    if (score >= 0.8)
        return 'High';
    if (score >= 0.6)
        return 'Medium';
    return 'Low';
};
// Quality Score Overview Component
/**
* Displays a card showing the overall quality score based on the average quality score of food trucks.
* @example
* QualityCard({ qualityStats: { avg_quality_score: 0.85, total_trucks: 50 } })
* Returns a JSX element with formatted overall quality score information.
* @param {Object} qualityStats - Contains various statistics about the quality scores.
* @param {number} qualityStats.avg_quality_score - Average quality score out of 1.
* @param {number} qualityStats.total_trucks - Total number of food trucks considered.
* @returns {JSX.Element} A card component displaying quality score information.
* @description
*   - Uses 'getScoreColor' and 'getQualityThreshold' functions to enhance data presentation.
*   - Formats the average quality score as a percentage with one decimal.
*   - Generates dynamic color styling for the score based on its value.
*/
const QualityScoreOverview = ({ qualityStats }) => {
    const averageScore = (qualityStats.avg_quality_score * 100).toFixed(1);
    const scoreColor = getScoreColor(qualityStats.avg_quality_score);
    return (<Card>
      <CardHeader>
        <CardTitle>Overall Quality Score</CardTitle>
        <CardDescription>Average data quality score across all food trucks</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="text-center">
          <div className={`text-6xl font-bold ${scoreColor}`}>{averageScore}%</div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {qualityStats.total_trucks} food trucks
          </p>
          <div className="mt-4 text-sm">
            <div className="flex justify-between items-center">
              <span>Quality Threshold:</span>
              <span className="font-medium">
                {getQualityThreshold(qualityStats.avg_quality_score)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);
};
// Main Data Quality Charts Component
export const DataQualityCharts = ({ qualityStats }) => {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <QualityScoreOverview qualityStats={qualityStats}/>
      <QualityDistributionChart qualityStats={qualityStats}/>
      <VerificationStatusChart qualityStats={qualityStats}/>
    </div>);
};
export default DataQualityCharts;
