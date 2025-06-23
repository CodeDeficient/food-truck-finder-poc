import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringFeaturesContent } from './MonitoringFeaturesContent';

export function MonitoringFeaturesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring Features</CardTitle>
        <CardDescription>
          State-of-the-art API monitoring and alerting capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MonitoringFeaturesContent />
      </CardContent>
    </Card>
  );
}
