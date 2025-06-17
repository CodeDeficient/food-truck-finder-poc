import React from 'react';
import { supabase } from '@/lib/supabase';
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
// @ts-expect-error TS(2792): Cannot find module 'lucide-react'. Did you mean to... Remove this comment to see the full error message
import { PlusCircle, Edit } from 'lucide-react';
// @ts-expect-error TS(2792): Cannot find module 'next/link'. Did you mean to se... Remove this comment to see the full error message
import Link from 'next/link';

interface Event {
  id: string;
  created_at: string;
  date: string;
  time: string;
  location: string;
  description: string;
  food_truck_id: string;
}

interface FoodTruckSchedule {
  id: string;
  created_at: string;
  food_truck_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  location: string;
}

async function getEventsAndSchedules() {
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (eventsError != undefined) {
    console.error('Error fetching events:', eventsError);
  }

  const { data: schedules, error: schedulesError } = await supabase
    .from('food_truck_schedules')
    .select('*')
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (schedulesError != undefined) {
    console.error('Error fetching schedules:', schedulesError);
  }

  return {
    events: events ?? [],
    schedules: schedules ?? [],
  };
}

// Page header component
function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Event & Schedule Management</h1>
      <Button asChild>
        <Link href="/admin/events/new">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Event/Schedule
        </Link>
      </Button>
    </div>
  );
}

// Events table component
function EventsTable({ events }: { readonly events: Event[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>
          Manage one-time and recurring events for food trucks. ({events.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food Truck ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event: Event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.food_truck_id}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.time}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/events/${event.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
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

// Schedules table component
function SchedulesTable({ schedules }: { readonly schedules: FoodTruckSchedule[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Food Truck Schedules</CardTitle>
        <CardDescription>
          Manage regular operating schedules for food trucks. ({schedules.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food Truck ID</TableHead>
              <TableHead>Day of Week</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule: FoodTruckSchedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">{schedule.food_truck_id}</TableCell>
                <TableCell>{schedule.day_of_week}</TableCell>
                <TableCell>{`${schedule.start_time} - ${schedule.end_time}`}</TableCell>
                <TableCell>{schedule.location}</TableCell>
                <TableCell>
                  <Badge variant={schedule.is_recurring ? 'default' : 'outline'}>
                    {schedule.is_recurring ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/schedules/${schedule.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
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

export default async function EventManagementPage() {
  const { events, schedules } = await getEventsAndSchedules();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader />
      <EventsTable events={events} />
      <SchedulesTable schedules={schedules} />
    </div>
  );
}
