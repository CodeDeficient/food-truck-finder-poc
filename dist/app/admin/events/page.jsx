import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
import Link from 'next/link';
/**
 * Fetches events and food truck schedules from the Supabase database.
 * @example
 * getEventsAndSchedules()
 * { events: [...], schedules: [...] }
 * @param {void} - This function takes no arguments.
 * @returns {Object} An object containing arrays of events and schedules.
 * @description
 *   - The function uses Supabase client to query the 'events' and 'food_truck_schedules' tables.
 *   - Events are ordered by descending date and time, while schedules are ordered by ascending day of the week and start time.
 *   - If an error occurs during fetching, it logs the error to the console and returns empty arrays.
 */
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
        events: events !== null && events !== void 0 ? events : [],
        schedules: schedules !== null && schedules !== void 0 ? schedules : [],
    };
}
// Page header component
/**
* Renders the page header for the event and schedule management section.
* @example
* PageHeader()
* <div>...</div>
* @returns {JSX.Element} Returns a JSX element that includes the header title and a button to add a new event/schedule.
* @description
*   - The header includes a button styled using a `Button` component with a `PlusCircle` icon.
*   - The button redirects to a specific page using a `Link` that points to the `/admin/events/new` URL.
*   - Utilizes Tailwind CSS classes for styling the header's layout and typography.
*/
function PageHeader() {
    return (<div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Event & Schedule Management</h1>
      <Button asChild>
        <Link href="/admin/events/new">
          <PlusCircle className="mr-2 size-4"/>
          Add New Event/Schedule
        </Link>
      </Button>
    </div>);
}
// Events table component
/**
 * Renders a table displaying upcoming events for food trucks.
 * @example
 * EventsTable({ events: [{ id: 1, food_truck_id: 'FT123', date: '2023-10-10', time: '10:00', location: 'Downtown', description: 'Fall Festival' }] })
 * <Card>...</Card>
 * @param {{readonly events: Event[]}} events - List of event objects to be displayed in the table.
 * @returns {JSX.Element} A React component representing the events table.
 * @description
 *   - Displays the total number of events within the card header.
 *   - Provides actions for each event entry to facilitate editing.
 */
function EventsTable({ events }) {
    return (<Card>
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
            {events.map((event) => (<TableRow key={event.id}>
                <TableCell className="font-medium">{event.food_truck_id}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.time}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell className="text-right">
                  <Button asChild>
                    <Link href={`/admin/events/${event.id}`}>
                      <Edit className="size-4"/>
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>);
}
// Schedules table component
/**
* Renders a table displaying food truck schedules.
* @example
* SchedulesTable({ schedules: [{ id: 1, food_truck_id: '123', day_of_week: 'Monday', start_time: '10:00 AM', end_time: '2:00 PM', location: 'Main St', is_recurring: true }] })
* <Card> ... </Card>
* @param {Object} {schedules} - An array of food truck schedule objects.
* @returns {JSX.Element} A JSX element containing the schedules table.
* @description
*   - Utilizes several UI components like Card, Table, and Badge for layout and styling.
*   - Maps over the schedules array to render individual rows within the table.
*   - Provides action buttons linked to edit each specific schedule entry.
*   - Includes conditional styling based on whether a schedule is recurring.
*/
function SchedulesTable({ schedules }) {
    return (<Card>
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
            {schedules.map((schedule) => (<TableRow key={schedule.id}>
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
                  <Button asChild>
                    <Link href={`/admin/schedules/${schedule.id}`}>
                      <Edit className="size-4"/>
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>);
}
export default async function EventManagementPage() {
    const { events, schedules } = await getEventsAndSchedules();
    return (<div className="flex flex-col gap-4">
      <PageHeader />
      <EventsTable events={events}/>
      <SchedulesTable schedules={schedules}/>
    </div>);
}
