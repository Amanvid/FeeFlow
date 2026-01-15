import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { googleSheetsService } from "@/lib/google-sheets";
import { addPayroll } from "@/app/actions/payroll";

export const revalidate = 0;

async function getData() {
  try {
    const [payrollData, staffData] = await Promise.all([
      googleSheetsService.getSheetData("payroll!A2:Z"),
      googleSheetsService.getSheetData("staff!A2:Z"),
    ]);

    const staffList = (staffData || []).map(s => ({ id: s[0], name: s[1] }));

    const records = (payrollData || []).map(p => ({
      id: p[0],
      staff_id: p[1],
      salary: parseFloat(p[2]) || 0,
      allowances: parseFloat(p[3]) || 0,
      deductions: parseFloat(p[4]) || 0,
      bonus: parseFloat(p[5]) || 0,
      month: p[6],
      paid_date: p[7],
      staff_name: staffList.find(s => s.id === p[1])?.name || "Unknown",
    })).sort((a, b) => (a.month || "").localeCompare(b.month || ""));

    return { records, staff: staffList };
  } catch {
    return { records: [], staff: [] };
  }
}

export default async function PayrollPage() {
  const { records, staff } = await getData();

  const totals = records.reduce((acc, r) => {
    acc.salary += r.salary;
    acc.allowances += r.allowances;
    acc.deductions += r.deductions;
    acc.bonus += r.bonus;
    return acc;
  }, { salary: 0, allowances: 0, deductions: 0, bonus: 0 });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll</h2>
          <p className="text-muted-foreground">Manage salaries, allowances, deductions and bonuses.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Total Salaries</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">GHS {totals.salary.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Allowances</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">GHS {totals.allowances.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Deductions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">GHS {totals.deductions.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Bonus</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">GHS {totals.bonus.toFixed(2)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addPayroll}>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Select name="staff_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input name="salary" type="number" step="0.01" placeholder="Salary" />
              <Input name="allowances" type="number" step="0.01" placeholder="Allowances" />
              <Input name="deductions" type="number" step="0.01" placeholder="Deductions" />
              <Input name="bonus" type="number" step="0.01" placeholder="Bonus" />
              <Input name="month" placeholder="2025-12" />
              <Input name="paid_date" type="date" />
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
              <TableHead>Month</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className="text-right">Salary</TableHead>
              <TableHead className="text-right">Allowances</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Bonus</TableHead>
              <TableHead>Paid Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No payroll records.</TableCell>
              </TableRow>
            ) : (
              records.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.month}</TableCell>
                  <TableCell>{r.staff_name}</TableCell>
                  <TableCell className="text-right">GHS {r.salary.toFixed(2)}</TableCell>
                  <TableCell className="text-right">GHS {r.allowances.toFixed(2)}</TableCell>
                  <TableCell className="text-right">GHS {r.deductions.toFixed(2)}</TableCell>
                  <TableCell className="text-right">GHS {r.bonus.toFixed(2)}</TableCell>
                  <TableCell>{r.paid_date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

