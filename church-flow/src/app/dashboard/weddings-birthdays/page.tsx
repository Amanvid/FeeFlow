import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { googleSheetsService } from "@/lib/google-sheets";
import { addWedding } from "@/app/actions/weddings";
import { addBirthday } from "@/app/actions/birthdays";

export const revalidate = 0;

async function getData() {
  try {
    const [weddingsData, birthdaysData, membersData, usersData] = await Promise.all([
      googleSheetsService.getSheetData("weddings!A2:Z"),
      googleSheetsService.getSheetData("birthdays!A2:Z"),
      googleSheetsService.getSheetData("members!A2:Z"),
      googleSheetsService.getSheetData("users!A2:Z"),
    ]);

    const usersMap = new Map<string, { name: string }>();
    (usersData || []).forEach(u => usersMap.set(u[0], { name: u[1] }));
    const members = (membersData || []).map(m => ({ id: m[0], name: usersMap.get(m[1])?.name || "Unknown" }));

    const weddings = (weddingsData || []).map(w => ({
      id: w[0],
      member_id: w[1],
      spouse_name: w[2],
      date: w[3],
      remarks: w[4],
      member_name: members.find(m => m.id === w[1])?.name || "Unknown",
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const birthdays = (birthdaysData || []).map(b => ({
      id: b[0],
      member_id: b[1],
      date: b[2],
      remarks: b[3],
      member_name: members.find(m => m.id === b[1])?.name || "Unknown",
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { weddings, birthdays, members };
  } catch {
    return { weddings: [], birthdays: [], members: [] };
  }
}

export default async function WeddingsBirthdaysPage() {
  const { weddings, birthdays, members } = await getData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weddings & Birthdays</h2>
          <p className="text-muted-foreground">Manage weddings and birthdays records.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record Wedding</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addWedding}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
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
                <Input name="spouse_name" placeholder="Spouse name" />
                <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                <Input name="remarks" placeholder="Remarks (optional)" />
              </div>
              <div className="mt-4">
                <Button type="submit">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record Birthday</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addBirthday}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
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
                <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                <Input name="remarks" placeholder="Remarks (optional)" />
              </div>
              <div className="mt-4">
                <Button type="submit">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weddings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Spouse</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weddings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No weddings recorded.</TableCell>
                    </TableRow>
                  ) : (
                    weddings.map(w => (
                      <TableRow key={w.id}>
                        <TableCell>{new Date(w.date).toLocaleDateString()}</TableCell>
                        <TableCell>{w.member_name}</TableCell>
                        <TableCell>{w.spouse_name}</TableCell>
                        <TableCell>{w.remarks}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Birthdays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {birthdays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No birthdays recorded.</TableCell>
                    </TableRow>
                  ) : (
                    birthdays.map(b => (
                      <TableRow key={b.id}>
                        <TableCell>{new Date(b.date).toLocaleDateString()}</TableCell>
                        <TableCell>{b.member_name}</TableCell>
                        <TableCell>{b.remarks}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

