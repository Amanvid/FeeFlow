import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { googleSheetsService } from "@/lib/google-sheets";
import { AddDepartmentDialog } from "./add-department-dialog";
import { EditDepartmentDialog } from "./edit-department-dialog";

export const revalidate = 0;

async function getDepartments() {
    try {
        const [departmentsData, usersData, membersData] = await Promise.all([
            googleSheetsService.getSheetData("departments!A2:Z"),
            googleSheetsService.getSheetData("users!A2:Z"),
            googleSheetsService.getSheetData("members!A2:Z"),
        ]);

        if (!departmentsData) return { departments: [], users: [] };

        const usersMap = new Map();
        const usersList: { id: string; name: string }[] = [];
        if (usersData) {
            usersData.forEach(u => {
                usersMap.set(u[0], u[1]); // id -> name
                usersList.push({ id: u[0], name: u[1] });
            });
        }

        const memberCounts = new Map();
        if (membersData) {
            membersData.forEach(m => {
                const deptId = m[4];
                memberCounts.set(deptId, (memberCounts.get(deptId) || 0) + 1);
            });
        }

        // departments: ['id', 'name', 'leader_id', 'description']
        const departments = departmentsData.map(d => ({
            id: d[0],
            name: d[1],
            leader_id: d[2],
            description: d[3],
            leader_name: usersMap.get(d[2]) || 'Unknown Leader',
            member_count: memberCounts.get(d[0]) || 0
        }));

        return { departments, users: usersList };

    } catch (error) {
        console.error("Error fetching departments:", error);
        return { departments: [], users: [] };
    }
}

export default async function DepartmentsPage() {
  const { departments, users } = await getDepartments();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">
            Manage church ministries and groups.
          </p>
        </div>
        <AddDepartmentDialog users={users} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">No departments found.</div>
        ) : (
            departments.map((dept) => (
            <Card key={dept.id}>
                <CardHeader>
                <CardTitle>{dept.name}</CardTitle>
                <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {dept.member_count} Members
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Leader: <span className="font-medium text-foreground">{dept.leader_name}</span>
                    </div>
                </div>
                </CardContent>
                <CardFooter>
                <EditDepartmentDialog department={dept} users={users} />
                </CardFooter>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}
