import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataProcessingQueue } from '@/lib/supabase';

interface FailedProcessingQueueTableProps {
  readonly processingQueue: {
    pending: DataProcessingQueue[];
    processing: DataProcessingQueue[];
    failed: DataProcessingQueue[];
    completed: DataProcessingQueue[];
  };
}

export function FailedProcessingQueueTable({ processingQueue }: FailedProcessingQueueTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Failed Data Processing Queue Items</CardTitle>
        <CardDescription>
          Items that failed during data processing (e.g., Gemini API errors).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Truck ID</TableHead>
              <TableHead>Processing Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Errors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processingQueue.failed.map((item: DataProcessingQueue) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.truck_id ?? 'N/A'}</TableCell>
                <TableCell>{item.processing_type}</TableCell>
                <TableCell>
                  <Badge variant="destructive">{item.status}</Badge>
                </TableCell>
                <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
