import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { googleSheetsService } from "@/lib/google-sheets";
import { addAttendance } from "@/app/actions/attendance";

export const revalidate = 0;

async function getData() {
  try {
    const [attendanceData, membersData, eventsData, usersData] = await Promise.all([
      googleSheetsService.getSheetData("attendance!A2:Z"),
      googleSheetsService.getSheetData("members!A2:Z"),
      googleSheetsService.getSheetData("events!A2:Z"),
      googleSheetsService.getSheetData("users!A2:Z"),
    ]);

    const usersMap = new Map<string, { name: string }>();
    (usersData || []).forEach(u => usersMap.set(u[0], { name: u[1] }));

    const membersMap = new Map<string, { name: string }>();
    (membersData || []).forEach(m => {
      const user = usersMap.get(m[1]);
      membersMap.set(m[0], { name: user?.name || "Unknown" });
    });

    const eventsMap = new Map<string, { title: string }>();
    (eventsData || []).forEach(e => eventsMap.set(e[0], { title: e[1] }));

    const attendance = (attendanceData || []).map(a => ({
      id: a[0],
      member_id: a[1],
      event_id: a[2],
      date: a[3],
      status: a[4],
      member_name: membersMap.get(a[1])?.name || "Unknown",
      event_title: eventsMap.get(a[2])?.title || "General",
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const members = (membersData || []).map(m => ({ id: m[0], user_id: m[1], name: usersMap.get(m[1])?.name || "Unknown" }));
    const events = (eventsData || []).map(e => ({ id: e[0], title: e[1] }));

    return { attendance, members, events };
  } catch {
    return { attendance: [], members: [], events: [] };
  }
}

export default async function AttendancePage() {
  const { attendance, members, events } = await getData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Track member and event attendance.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addAttendance}>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="col-span-1">
                <Select name="memberId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Select name="eventId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select event (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General</SelectItem>
                    {events.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="col-span-1">
                <Select name="status" defaultValue="present">
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No attendance records.</TableCell>
              </TableRow>
            ) : (
              attendance.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell>{a.member_name}</TableCell>
                  <TableCell>{a.event_title}</TableCell>
                  <TableCell>{a.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
