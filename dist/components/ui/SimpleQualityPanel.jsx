'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings, Loader2 } from 'lucide-react';
/**
 * Performs a data quality recalculation by sending a request to the server.
 * @example
 * sync()
 * {
 *   success: true,
 *   data: { updated: 5, errors: 0 }
 * }
 * @async
 * @returns {Promise<RecalculateAllResult>} Object indicating success with updated count & errors, or failure with error message.
 * @description
 *   - Sends a POST request to '/api/admin/data-quality' with a JSON body containing action 'recalculate_all'.
 *   - Checks if the response object contains a 'success' property to verify result.
 *   - Returns structured result or error message based on response contents.
 */
const recalculateAllScores = async () => {
    var _a, _b, _c, _d, _e;
    const response = await fetch('/api/admin/data-quality', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'recalculate_all',
        }),
    });
    const result = await response.json();
    if (typeof result === 'object' && result !== null && 'success' in result) {
        return result.success === true
            ? {
                success: true,
                data: {
                    updated: (_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.updated) !== null && _b !== void 0 ? _b : 0,
                    errors: (_d = (_c = result.data) === null || _c === void 0 ? void 0 : _c.errors) !== null && _d !== void 0 ? _d : 0,
                },
            }
            : {
                success: false,
                error: (_e = result.error) !== null && _e !== void 0 ? _e : 'Failed to recalculate quality scores',
            };
    }
    return { success: false, error: 'Invalid response format' };
};
/**
* Renders a panel displaying quality score thresholds.
* @example
* SimpleQualityPanel()
* <div className="border rounded-lg p-4 bg-blue-50/50">
*   <h4 className="font-medium mb-2 text-blue-900">Quality Score Thresholds</h4>
*   <div className="space-y-1 text-sm text-blue-800">
*     <div className="flex justify-between">
*       <span>High Quality:</span>
*       <Badge className="bg-green-100 text-green-800">≥ 80%</Badge>
*     </div>
*     <div className="flex justify-between">
*       <span>Medium Quality:</span>
*       <Badge className="bg-yellow-100 text-yellow-800">60% - 79%</Badge>
*     </div>
*     <div className="flex justify-between">
*       <span>Low Quality:</span>
*       <Badge className="bg-red-100 text-red-800">{`< 60%`}</Badge>
*     </div>
*   </div>
* </div>
* @returns {JSX.Element} A React component containing styled elements that describe quality score classifications.
* @description
*   - Utilizes Tailwind CSS utility classes for styling.
*   - Contains hardcoded logic for score thresholds.
*   - Uses a badge component to represent each quality level.
*/
const QualityScoreThresholds = () => (<div className="border rounded-lg p-4 bg-blue-50/50">
    <h4 className="font-medium mb-2 text-blue-900">Quality Score Thresholds</h4>
    <div className="space-y-1 text-sm text-blue-800">
      <div className="flex justify-between">
        <span>High Quality:</span>
        <Badge className="bg-green-100 text-green-800">≥ 80%</Badge>
      </div>
      <div className="flex justify-between">
        <span>Medium Quality:</span>
        <Badge className="bg-yellow-100 text-yellow-800">60% - 79%</Badge>
      </div>
      <div className="flex justify-between">
        <span>Low Quality:</span>
        <Badge className="bg-red-100 text-red-800">{`< 60%`}</Badge>
      </div>
    </div>
  </div>);
/**
 * Handles the recalculation of all quality scores and updates the component state accordingly.
 * @example
 * handleRecalculateAll()
 * // Alerts on success or failure and refreshes data
 * @param {function} onRefresh - Optional callback function to refresh data upon successful recalculation.
 * @returns {void} No return value.
 * @description
 *   - Sets a loading state while recalculating quality scores.
 *   - Notifies the user about the success or failure of the operation through alerts.
 *   - Automatically calls an optional `onRefresh` callback if provided, after successful recalculation.
 */
export const SimpleQualityPanel = ({ onRefresh }) => {
    const [isRecalculating, setIsRecalculating] = useState(false);
    /**
     * Recalculates quality scores for trucks and updates the UI based on the results.
     * @example
     * sync()
     * Alerts the user about the success or failure of the score recalculation.
     * @param {Function} {setIsRecalculating} - Function to update the recalculation status.
     * @param {Object} {recalculateAllScores} - Async function that recalculates all scores and returns a result object.
     * @param {Function} {onRefresh} - Optional function to refresh the UI after scores are updated.
     * @returns {void} No return value.
     * @description
     *   - Alerts the user about the number of trucks updated and any errors encountered.
     *   - Logs errors to the console for debugging purposes.
     *   - Uses the `finally` block to ensure recalculation status is updated regardless of success or failure.
     */
    const handleRecalculateAll = async () => {
        var _a, _b;
        setIsRecalculating(true);
        try {
            const result = await recalculateAllScores();
            if (result.success) {
                alert(`Quality scores updated successfully! ${(_a = result.data) === null || _a === void 0 ? void 0 : _a.updated} trucks updated, ${(_b = result.data) === null || _b === void 0 ? void 0 : _b.errors} errors.`);
                onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
            }
            else {
                throw new Error(result.error);
            }
        }
        catch (error) {
            console.error('Error recalculating quality scores:', error);
            ;
        }
        finally {
            setIsRecalculating(false);
        }
    };
    return (<Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-5"/>
          Quality Management Operations
        </CardTitle>
        <CardDescription>
          Bulk operations for managing data quality scores across all food trucks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={() => {
            void handleRecalculateAll();
        }} disabled={isRecalculating} className="flex items-center gap-2" variant="default">
            {isRecalculating ? (<Loader2 className="size-4 animate-spin"/>) : (<RefreshCw className="size-4"/>)}
            Recalculate All Scores
          </Button>
        </div>

        <QualityScoreThresholds />

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Recalculate All:</strong> Updates quality scores for all food trucks using the
            latest algorithm.
          </p>
        </div>
      </CardContent>
    </Card>);
};
export default SimpleQualityPanel;
