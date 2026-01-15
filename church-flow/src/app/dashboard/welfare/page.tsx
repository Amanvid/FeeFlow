import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { googleSheetsService } from "@/lib/google-sheets";

export const revalidate = 0;

async function getData() {
  try {
    const [welfareData, membersData, usersData] = await Promise.all([
      googleSheetsService.getSheetData("welfare!A2:Z"),
      googleSheetsService.getSheetData("members!A2:Z"),
      googleSheetsService.getSheetData("users!A2:Z"),
    ]);

    const usersMap = new Map<string, { name: string }>();
    (usersData || []).forEach(u => usersMap.set(u[0], { name: u[1] }));

    const membersList = (membersData || []).map(m => ({ id: m[0], name: usersMap.get(m[1])?.name || "Unknown" }));

    const welfare = (welfareData || []).map(w => ({
      id: w[0],
      member_id: w[1],
      amount: parseFloat(w[2]) || 0,
      date: w[3],
      type: w[4],
      note: w[5],
      member_name: membersList.find(m => m.id === w[1])?.name || "Unknown",
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = welfare.reduce((sum, r) => sum + r.amount, 0);

    return { welfare, members: membersList, total };
  } catch {
    return { welfare: [], members: [], total: 0 };
  }
}

export default async function WelfarePage() {
  const { welfare, members, total } = await getData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welfare</h2>
          <p className="text-muted-foreground">Track welfare contributions and support funds.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Welfare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Welfare Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="#">
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
                <Select name="type" defaultValue="donation">
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
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
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {welfare.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No records found.</TableCell>
              </TableRow>
            ) : (
              welfare.map(w => (
                <TableRow key={w.id}>
                  <TableCell>{new Date(w.date).toLocaleDateString()}</TableCell>
                  <TableCell>{w.member_name}</TableCell>
                  <TableCell className="capitalize">{w.type}</TableCell>
                  <TableCell className="text-right font-medium">GHS {w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{w.note}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

