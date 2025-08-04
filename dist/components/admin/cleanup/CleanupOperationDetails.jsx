import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { operationConfig } from './OperationSelector';
/**
 * Renders a list of cleanup operation details including icons, success rates, badges, progress bars, and error alerts.
 * @example
 * CleanupOperationDetails({ operations: [{ type: 'delete', description: 'Delete old records', successCount: 10, affectedCount: 12, errors: ['Error1', 'Error2'], errorCount: 2 }] })
 * // The rendered component displays operation details for each entry in the operations array.
 * @param {CleanupOperationDetailsProps} { operations } - An object containing an array of operation details.
 * @returns {JSX.Element} A React component representing details of each cleanup operation.
 * @description
 *   - Displays operation icons, descriptions, and success rate badges.
 *   - Conditionally renders a progress bar based on the success rate.
 *   - Shows an alert with errors if any exist in the operation.
 *   - Limits error display to the first three errors followed by a count of remaining errors.
 */
export function CleanupOperationDetails({ operations }) {
    return (<div className="space-y-3">
      <h4 className="font-semibold">Operation Details</h4>
      {operations.map((operation, index) => {
            var _a;
            return (<div key={index} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {(_a = operationConfig[operation.type]) === null || _a === void 0 ? void 0 : _a.icon}
              <span className="font-medium">{operation.description}</span>
            </div>
            <Badge variant={operation.errorCount > 0 ? 'destructive' : 'default'}>
              {operation.successCount}/{operation.affectedCount}
            </Badge>
          </div>

          {operation.affectedCount > 0 && (<Progress value={(operation.successCount / operation.affectedCount) * 100} className="h-2 mb-2"/>)}

          {operation.errors.length > 0 && (<Alert className="mt-2">
              <AlertTriangle className="size-4"/>
              <AlertTitle>Errors ({operation.errors.length})</AlertTitle>
              <AlertDescription>
                <div className="max-h-20 overflow-y-auto text-xs">
                  {operation.errors.slice(0, 3).map((error, i) => (<div key={i}>{error}</div>))}
                  {operation.errors.length > 3 && (<div>... and {operation.errors.length - 3} more</div>)}
                </div>
              </AlertDescription>
            </Alert>)}
        </div>);
        })}
    </div>);
}
