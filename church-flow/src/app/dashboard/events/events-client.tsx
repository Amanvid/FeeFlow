"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, MapPin } from "lucide-react";
import { AddEventDialog } from "./add-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";

type Event = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  department_id: string;
  event_type: string;
  department_name?: string;
};

interface EventsClientProps {
  initialEvents: Event[];
  departments: { id: string; name: string }[];
}

export function EventsClient({ initialEvents, departments }: EventsClientProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Optional: Filter events by selected date
  const filteredEvents = date 
    ? initialEvents.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.toDateString() === date.toDateString();
      })
    : initialEvents;

  // If no events on selected date, maybe show all upcoming or a message?
  // For now let's just show filtered list if date is selected, else all.
  // Actually, usually "Upcoming Events" shows future events regardless of calendar selection, 
  // or calendar selection filters the list. Let's stick to showing all if nothing matches or just the filtered ones.
  // To match the previous UI, let's just show the list.

  const displayEvents = filteredEvents.length > 0 ? filteredEvents : initialEvents; 

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Manage church calendar and upcoming programs.
          </p>
        </div>
        <AddEventDialog departments={departments} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
                {date ? `Events for ${date.toDateString()}` : "Upcoming Events"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events found.</p>
              ) : (
                displayEvents.map((event) => (
                    <div
                    key={event.id}
                    className="relative flex items-start space-x-4 rounded-md border p-4 pr-12"
                    >
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                        {event.title}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(event.start_date).toLocaleString()}
                        </div>
                        {event.department_name && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <span className="font-medium mr-1">Dept:</span> {event.department_name}
                            </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        Main Auditorium
                        </div>
                    </div>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {event.event_type}
                    </div>
                    <EditEventDialog event={event} departments={departments} />
                    </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
