import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { googleSheetsService } from "@/lib/google-sheets";
import { addTithe } from "@/app/actions/tithes";

export const revalidate = 0;

async function getData() {
  try {
    const [tithesData, membersData, usersData] = await Promise.all([
      googleSheetsService.getSheetData("tithes!A2:Z"),
      googleSheetsService.getSheetData("members!A2:Z"),
      googleSheetsService.getSheetData("users!A2:Z"),
    ]);

    const usersMap = new Map<string, { name: string }>();
    (usersData || []).forEach(u => usersMap.set(u[0], { name: u[1] }));

    const membersList = (membersData || []).map(m => ({ id: m[0], name: usersMap.get(m[1])?.name || "Unknown" }));

    const tithes = (tithesData || []).map(t => ({
      id: t[0],
      member_id: t[1],
      amount: parseFloat(t[2]) || 0,
      date: t[3],
      recorded_by: t[4],
      note: t[5],
      member_name: membersList.find(m => m.id === t[1])?.name || "Unknown",
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = tithes.reduce((sum, t) => sum + t.amount, 0);

    return { tithes, members: membersList, total };
  } catch {
    return { tithes: [], members: [], total: 0 };
  }
}

export default async function TithesPage() {
  const { tithes, members, total } = await getData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tithes & Contributions</h2>
          <p className="text-muted-foreground">Record and view financial contributions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Tithes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addTithe}>
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
                <Input name="amount" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="col-span-1">
                <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="col-span-1">
                <Input name="recorded_by" placeholder="Finance Team" />
              </div>
            </div>
            <div className="mt-4">
              <Input name="note" placeholder="Notes (optional)" />
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
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tithes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No records found.</TableCell>
              </TableRow>
            ) : (
              tithes.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>{t.member_name}</TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">+GHS {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{t.recorded_by}</TableCell>
                  <TableCell>{t.note}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

