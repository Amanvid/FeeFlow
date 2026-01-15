import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { googleSheetsService } from "@/lib/google-sheets";
import { addSoulWinning } from "@/app/actions/soul-winning";

export const revalidate = 0;

async function getData() {
  try {
    const [soulData, membersData, usersData] = await Promise.all([
      googleSheetsService.getSheetData("soul_winning!A2:Z"),
      googleSheetsService.getSheetData("members!A2:Z"),
      googleSheetsService.getSheetData("users!A2:Z"),
    ]);

    const usersMap = new Map<string, { name: string }>();
    (usersData || []).forEach(u => usersMap.set(u[0], { name: u[1] }));

    const membersList = (membersData || []).map(m => ({ id: m[0], name: usersMap.get(m[1])?.name || "Unknown" }));

    const records = (soulData || []).map(r => ({
      id: r[0],
      member_id: r[1],
      date: r[2],
      location: r[3],
      notes: r[4],
      follow_up_status: r[5],
      member_name: membersList.find(m => m.id === r[1])?.name || "Unknown",
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = records.length;
    const pendingFollowUps = records.filter(r => (r.follow_up_status || "").toLowerCase() === "pending").length;

    return { records, members: membersList, total, pendingFollowUps };
  } catch {
    return { records: [], members: [], total: 0, pendingFollowUps: 0 };
  }
}

export default async function SoulWinningPage() {
  const { records, members, total, pendingFollowUps } = await getData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Soul Winning</h2>
          <p className="text-muted-foreground">Track soul-winning activities and follow-ups.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Souls Won</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFollowUps}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Soul Winning Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addSoulWinning}>
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
                <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="col-span-1">
                <Input name="location" placeholder="Location" />
              </div>
              <div className="col-span-1">
                <Select name="follow_up_status">
                  <SelectTrigger>
                    <SelectValue placeholder="Follow-up status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Input name="notes" placeholder="Notes (optional)" />
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
              <TableHead>Location</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No records found.</TableCell>
              </TableRow>
            ) : (
              records.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.member_name}</TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell className="capitalize">{r.follow_up_status || "pending"}</TableCell>
                  <TableCell>{r.notes}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
