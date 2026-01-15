import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { googleSheetsService } from "@/lib/google-sheets";
import { addStaff } from "@/app/actions/staff";

export const revalidate = 0;

async function getData() {
  try {
    const staffData = await googleSheetsService.getSheetData("staff!A2:Z");
    const staff = (staffData || []).map(s => ({
      id: s[0],
      name: s[1],
      email: s[2],
      phone: s[3],
      position: s[4],
      start_date: s[5],
      status: s[6],
    }));
    return { staff };
  } catch {
    return { staff: [] };
  }
}

export default async function StaffPage() {
  const { staff } = await getData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff</h2>
          <p className="text-muted-foreground">Manage church employees.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addStaff}>
            <div className="grid gap-4 md:grid-cols-3">
              <Input name="name" placeholder="Name" required />
              <Input name="email" type="email" placeholder="Email" />
              <Input name="phone" placeholder="Phone" />
              <Input name="position" placeholder="Position" required />
              <Input name="start_date" type="date" />
              <div>
                <Select name="status" defaultValue="active">
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No staff found.</TableCell>
              </TableRow>
            ) : (
              staff.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.position}</TableCell>
                  <TableCell>{s.start_date}</TableCell>
                  <TableCell className="capitalize">{s.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

