import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
/**
* Represents a card component detailing technical implementation aspects such as monitored APIs, alert thresholds, and optimization features.
* @example
* TechnicalDetailsCard()
* Returns a JSX element that displays information on API monitoring, alert thresholds, and optimization strategies.
* @returns {JSX.Element} A structured card component providing technical details and descriptions regarding monitoring systems.
* @description
*   - Utilizes semantic HTML within a React component for enhanced accessibility.
*   - Features grid layout to organize information distinctly in three columns.
*   - Provides both qualitative and quantitative data for better insight into monitoring metrics and optimization strategies.
*/
export function TechnicalDetailsCard() {
    return (<Card>
      <CardHeader>
        <CardTitle>Technical Implementation</CardTitle>
        <CardDescription>Advanced monitoring system built with SOTA practices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Monitored APIs</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Gemini AI (1,500 req/day, 32K tokens)</li>
              <li>• Firecrawl (500 req/day)</li>
              <li>• Tavily Search (1,000 req/day)</li>
              <li>• Supabase (50K req/day)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Alert Thresholds</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Warning: 80% usage</li>
              <li>• Critical: 95% usage</li>
              <li>• Auto-throttling: 95%+</li>
              <li>• Rate limit reset tracking</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Optimization Features</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Request queuing recommendations</li>
              <li>• Caching strategy suggestions</li>
              <li>• Token usage optimization</li>
              <li>• Batch processing guidance</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>);
}
