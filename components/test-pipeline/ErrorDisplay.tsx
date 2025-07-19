import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ErrorDisplay({ error }: { readonly error?: string }) {
  if (error === undefined) return;

  return (
    <Card className="border-red-500">
      <CardHeader>
        <CardTitle className="text-red-600">Test Failed</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{error}</p>
      </CardContent>
    </Card>
  );
}
