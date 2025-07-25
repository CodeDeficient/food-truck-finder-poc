import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
function getBadgeVariant(status) {
    if (status === 'completed') {
        return 'default';
    }
    if (status === 'failed') {
        return 'destructive';
    }
    return 'outline';
}
/**
 * Renders a table row displaying details of a scraping job.
 * @example
 * ScrapingJobRow({ job })
 * // returns a JSX element representing the job details in a table row.
 * @param {Object} {job} - Job object containing various job details.
 * @returns {JSX.Element} A table row element with job details.
 * @description
 *   - Displays the job's status using a badge whose appearance varies based on the status.
 *   - Shows a 'Retry' button only if the job status is 'failed'.
 *   - Formats the scheduled and completed times as locale strings.
 *   - Default display for 'completed_at' is 'N/A' if the job is not completed.
 */
export function ScrapingJobRow({ job }) {
    var _a;
    return (<TableRow key={job.id}>
      <TableCell className="font-medium">{job.job_type}</TableCell>
      <TableCell>{(_a = job.target_url) !== null && _a !== void 0 ? _a : job.target_handle}</TableCell>
      <TableCell>
        <Badge variant={getBadgeVariant(job.status)}>{job.status}</Badge>
      </TableCell>
      <TableCell>{job.priority}</TableCell>
      <TableCell>
        {job.retry_count}/{job.max_retries}
      </TableCell>
      <TableCell>{new Date(job.scheduled_at).toLocaleString()}</TableCell>
      <TableCell>
        {job.completed_at == undefined ? 'N/A' : new Date(job.completed_at).toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {job.status === 'failed' && (<Button variant="outline" size="sm" className="mr-2" type="button">
            Retry
          </Button>)}
        <Button variant="outline" size="sm" type="button">
          View Logs
        </Button>
      </TableCell>
    </TableRow>);
}
