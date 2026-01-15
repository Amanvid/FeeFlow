import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, Plus, Download } from "lucide-react";
import { googleSheetsService } from "@/lib/google-sheets";
import { AddRecordDialog } from "./add-record-dialog";
import { EditRecordDialog } from "./edit-record-dialog";

export const revalidate = 0;

async function getFinanceData() {
    try {
        const recordsData = await googleSheetsService.getSheetData("financial_records!A2:Z");
        
        if (!recordsData) return { records: [], stats: { income: 0, expenses: 0, net: 0 } };

        // financial_records: ['id', 'type', 'category', 'amount', 'recorded_by', 'date']
        const records = recordsData.map(r => ({
            id: r[0],
            type: r[1],
            category: r[2],
            amount: parseFloat(r[3]) || 0,
            recorded_by: r[4],
            date: r[5],
            description: r[2] // Use category as description for now
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const income = records
            .filter(r => r.type === 'Income')
            .reduce((sum, r) => sum + r.amount, 0);

        const expenses = records
            .filter(r => r.type === 'Expense')
            .reduce((sum, r) => sum + r.amount, 0);

        return {
            records,
            stats: {
                income,
                expenses,
                net: income - expenses
            }
        };

    } catch (error) {
        console.error("Error fetching finance data:", error);
        return { records: [], stats: { income: 0, expenses: 0, net: 0 } };
    }
}

export default async function FinancePage() {
  const { records, stats } = await getFinanceData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
          <p className="text-muted-foreground">
            Track income, expenses, and donations.
          </p>
        </div>
        <div className="flex space-x-2">
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <AddRecordDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <CardTitle className="text-sm font-medium text-muted-foreground">
                GHS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                GHS {stats.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No transactions found.</TableCell>
                    </TableRow>
                ) : (
                    records.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell>{record.description}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    record.type === 'Income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {record.type}
                                </span>
                            </TableCell>
                            <TableCell>{record.recorded_by}</TableCell>
                            <TableCell className={`text-right font-medium ${
                                record.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                                {record.type === 'Income' ? '+' : '-'}GHS {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right">
                                <EditRecordDialog record={record} />
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
