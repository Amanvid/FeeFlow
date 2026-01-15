import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { googleSheetsService } from "@/lib/google-sheets";
import { addAsset } from "@/app/actions/assets";

export const revalidate = 0;

async function getData() {
  try {
    const assetsData = await googleSheetsService.getSheetData("assets!A2:Z");
    const assets = (assetsData || []).map(a => ({
      id: a[0],
      name: a[1],
      category: a[2],
      purchase_date: a[3],
      cost: parseFloat(a[4]) || 0,
      status: a[5],
      location: a[6],
      notes: a[7],
    }));
    const totalCost = assets.reduce((sum, a) => sum + (a.cost || 0), 0);
    return { assets, totalCost };
  } catch {
    return { assets: [], totalCost: 0 };
  }
}

export default async function AssetsPage() {
  const { assets, totalCost } = await getData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
          <p className="text-muted-foreground">Track property, equipment and other assets.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Asset Cost</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">GHS {totalCost.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addAsset}>
            <div className="grid gap-4 md:grid-cols-4">
              <Input name="name" placeholder="Asset name" required />
              <Input name="category" placeholder="Category" required />
              <Input name="purchase_date" type="date" />
              <Input name="cost" type="number" step="0.01" placeholder="0.00" />
              <div>
                <Select name="status" defaultValue="active">
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input name="location" placeholder="Location" />
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
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No assets found.</TableCell>
              </TableRow>
            ) : (
              assets.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell>{a.location}</TableCell>
                  <TableCell className="capitalize">{a.status}</TableCell>
                  <TableCell>{a.purchase_date}</TableCell>
                  <TableCell className="text-right">GHS {a.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

