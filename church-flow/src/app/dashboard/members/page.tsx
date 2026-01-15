import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { googleSheetsService } from "@/lib/google-sheets";
import { AddMemberDialog } from "./add-member-dialog";
import { EditMemberDialog } from "./edit-member-dialog";

export const revalidate = 0;

async function getMembers() {
  try {
    const [membersData, usersData] = await Promise.all([
      googleSheetsService.getSheetData("members!A2:Z"),
      googleSheetsService.getSheetData("users!A2:Z"),
    ]);

    if (!membersData || !usersData) return [];

    const usersMap = new Map();
    usersData.forEach((u) => {
        // users: ['id', 'name', 'email', 'phone', 'password', 'role', 'status', 'created_at']
        usersMap.set(u[0], {
            name: u[1],
            email: u[2],
            phone: u[3],
            role: u[5],
            status: u[6]
        });
    });

    // members: ['id', 'user_id', 'membership_status', 'date_joined', 'department_id', 'baptism_status']
    return membersData.map((m) => {
        const user = usersMap.get(m[1]) || {};
        return {
            id: m[0],
            user_id: m[1],
            membership_status: m[2],
            date_joined: m[3],
            department_id: m[4],
            baptism_status: m[5],
            user: {
                name: user.name || 'Unknown',
                email: user.email || 'N/A',
                phone: user.phone || 'N/A',
                role: user.role || 'N/A',
                status: user.status || 'N/A',
            }
        };
    });

  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Manage church members, visitors, and new converts.
          </p>
        </div>
        <AddMemberDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Baptism</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No members found.
                    </TableCell>
                </TableRow>
            ) : (
                members.map((member) => (
                <TableRow key={member.id}>
                    <TableCell className="font-medium">
                        <div>{member.user.name}</div>
                        <div className="text-sm text-muted-foreground">{member.user.email}</div>
                    </TableCell>
                    <TableCell>{member.user.phone}</TableCell>
                    <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            member.membership_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {member.membership_status}
                        </span>
                    </TableCell>
                    <TableCell>{member.baptism_status}</TableCell>
                    <TableCell>{member.date_joined}</TableCell>
                    <TableCell className="text-right">
                        <EditMemberDialog member={member} />
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
