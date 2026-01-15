import { googleSheetsService } from "@/lib/google-sheets";
import { EventsClient } from "./events-client";

export const revalidate = 0;

async function getData() {
    try {
        const [eventsData, departmentsData] = await Promise.all([
            googleSheetsService.getSheetData("events!A2:Z"),
            googleSheetsService.getSheetData("departments!A2:Z")
        ]);

        const departments = (departmentsData || []).map(d => ({
            id: d[0],
            name: d[1]
        }));

        const deptMap = new Map();
        departments.forEach(d => deptMap.set(d.id, d.name));

        const events = (eventsData || []).map(e => ({
            id: e[0],
            title: e[1],
            start_date: e[2],
            end_date: e[3],
            department_id: e[4],
            event_type: e[5],
            department_name: deptMap.get(e[4]) || 'General'
        })).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

        return { events, departments };

    } catch (error) {
        console.error("Error fetching data:", error);
        return { events: [], departments: [] };
    }
}

export default async function EventsPage() {
  const { events, departments } = await getData();
  return <EventsClient initialEvents={events} departments={departments} />;
}
