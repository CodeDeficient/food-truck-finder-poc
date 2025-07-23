import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StageResultDetails } from './StageResultDetails';
export function StageResultCard({ stageName, result }) {
    if (!result)
        return;
    return (<Card className="border-red-500">
      <CardHeader>
        <CardTitle>{stageName}</CardTitle>
        <CardDescription>
          Status:{' '}
          <span className={result.status === 'Success' ? 'text-green-500' : 'text-red-500'}>
            {result.status}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StageResultDetails result={result}/>
      </CardContent>
    </Card>);
}
