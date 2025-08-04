interface RecentErrorsCardProps {
    readonly failedProcessingQueueItemsCount: number;
}
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
export declare function RecentErrorsCard({ failedProcessingQueueItemsCount, }: Readonly<RecentErrorsCardProps>): import("react").JSX.Element;
export {};
