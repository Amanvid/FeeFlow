import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { googleSheetsService } from "@/lib/google-sheets";
import { Plus, UserCog } from "lucide-react";
import { EditUserDialog } from "./edit-user-dialog";
import { AddUserDialog } from "./add-user-dialog";

export const revalidate = 0;

async function getUsers() {
    try {
        const usersData = await googleSheetsService.getSheetData("users!A2:Z");
        
        if (!usersData) return [];

        // users: ['id', 'name', 'email', 'phone', 'password', 'role', 'status', 'created_at']
        return usersData.map(u => ({
            id: u[0],
            name: u[1],
            email: u[2],
            phone: u[3],
            role: u[5],
            status: u[6]
        }));

    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export default async function SettingsPage() {
  const users = await getUsers();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage application settings and system users.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage users who have access to the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end mb-4">
                    <AddUserDialog />
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No users found.</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium flex items-center">
                                            <UserCog className="mr-2 h-4 w-4 text-gray-500" />
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="capitalize">{user.role}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <EditUserDialog user={user} />
                                        </TableCell>
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
