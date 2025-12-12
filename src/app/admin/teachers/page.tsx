import { getTeacherUsers, getNonTeacherUsers } from "@/lib/data";
import TeachersTable from "@/components/admin/teachers-table";
import NonTeachersTable from "@/components/admin/non-teachers-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default async function TeachersPage() {
  const teachers = await getTeacherUsers();
  const nonTeachers = await getNonTeacherUsers();

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const inactiveTeachers = teachers.filter(t => t.status !== 'active').length;

  const totalNonTeachers = nonTeachers.length;
  const activeNonTeachers = nonTeachers.filter(t => t.status === 'active').length;
  const inactiveNonTeachers = nonTeachers.filter(t => t.status !== 'active').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
        <p className="text-muted-foreground">
          Manage teaching and non-teaching staff members
        </p>
      </div>
      <Tabs defaultValue="teachers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teachers">Teaching Staff</TabsTrigger>
          <TabsTrigger value="non-teachers">Non-Teaching Staff</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teachers" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Teachers</CardDescription>
                <CardTitle className="text-4xl">{totalTeachers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  All registered teachers
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Teachers</CardDescription>
                <CardTitle className="text-4xl text-green-600">{activeTeachers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Currently active teachers
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Inactive Teachers</CardDescription>
                <CardTitle className="text-4xl text-red-600">{inactiveTeachers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Inactive teachers
                </div>
              </CardContent>
            </Card>
          </div>
          
          <TeachersTable teachers={teachers} />
        </TabsContent>
        
        <TabsContent value="non-teachers" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Non-Teachers</CardDescription>
                <CardTitle className="text-4xl">{totalNonTeachers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  All registered non-teaching staff
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Non-Teachers</CardDescription>
                <CardTitle className="text-4xl text-green-600">{activeNonTeachers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Currently active non-teaching staff
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Inactive Non-Teachers</CardDescription>
                <CardTitle className="text-4xl text-red-600">{inactiveNonTeachers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Inactive non-teaching staff
                </div>
              </CardContent>
            </Card>
          </div>
          
          <NonTeachersTable nonTeachers={nonTeachers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}