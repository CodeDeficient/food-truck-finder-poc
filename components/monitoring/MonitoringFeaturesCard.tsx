import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringFeaturesContent } from './MonitoringFeaturesContent';

/**
 * Renders a card displaying monitoring features.
 * @example
 * MonitoringFeaturesCard()
 * <Card>...</Card>
 * @returns {JSX.Element} Component representing the monitoring features card.
 * @description
 *   - Incorporates child components, which handle further content structure.
 *   - Designed for a UI framework supporting JSX, such as React.
 */
export function MonitoringFeaturesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring Features</CardTitle>
        <CardDescription>State-of-the-art API monitoring and alerting capabilities</CardDescription>
      </CardHeader>
      <CardContent>
        <MonitoringFeaturesContent />
      </CardContent>
    </Card>
  );
}
