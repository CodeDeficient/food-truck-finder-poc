import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
/**
* Displays a card component that shows the count of recent error items from a data processing queue.
* @example
* RecentErrorsCard({ failedProcessingQueueItemsCount: 10 })
* Displays a card with the title "Recent Errors" and shows the value "10".
* @param {Object} props - The properties object.
* @param {number} props.failedProcessingQueueItemsCount - The number of failed processing queue items.
* @returns {JSX.Element} A card component displaying the count of recent errors with relevant styling.
* @description
*   - Utilizes the Card, CardHeader, CardTitle, CardContent, and AlertTriangle components from the component library.
*   - Includes text styling for headers and counts to create a visual hierarchy.
*   - The AlertTriangle icon is used to indicate an error status visually.
*/
export function RecentErrorsCard({ failedProcessingQueueItemsCount, }) {
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
        <AlertTriangle className="size-4 text-muted-foreground"/>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{failedProcessingQueueItemsCount}</div>
        <p className="text-xs text-muted-foreground">from data processing queue</p>
      </CardContent>
    </Card>);
}
