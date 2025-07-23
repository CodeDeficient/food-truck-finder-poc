'use client';
/**
 * Displays the status of scraping jobs in a styled component.
 * @example
 * ScrapingJobsStatus({ scrapingJobs: { active: 2, completed: 5, pending: 1, failed: 0 } })
 * Returns a styled div highlighting four states: Active, Completed, Pending, and Failed.
 * @param {Object} scrapingJobs - An object containing the counts of various scraping job statuses.
 * @returns {JSX.Element} A JSX element representing the status of scraping jobs.
 * @description
 *   - The component is styled using Tailwind CSS classes.
 *   - The status values are expected to be numerical, representing counts.
 *   - Conditionally renders if `scrapingJobs` is not provided.
 *   - Supports responsive grid layout for different screen sizes.
 */
export function ScrapingJobsStatus({ scrapingJobs }) {
    if (!scrapingJobs)
        return;
    return (<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Scraping Jobs Status</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-blue-600">Active:</span>
          <span className="ml-1 font-medium">{scrapingJobs.active}</span>
        </div>
        <div>
          <span className="text-green-600">Completed:</span>
          <span className="ml-1 font-medium">{scrapingJobs.completed}</span>
        </div>
        <div>
          <span className="text-yellow-600">Pending:</span>
          <span className="ml-1 font-medium">{scrapingJobs.pending}</span>
        </div>
        <div>
          <span className="text-red-600">Failed:</span>
          <span className="ml-1 font-medium">{scrapingJobs.failed}</span>
        </div>
      </div>
    </div>);
}
