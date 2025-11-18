
import { getAllStudents } from "@/lib/data";
import StudentsTable from "@/components/admin/students-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, UserPlus } from "lucide-react";

export default async function AdminStudentsPage() {
  const students = await getAllStudents();

  // Calculate student statistics
  const totalStudents = students.length;
  const maleStudents = students.filter(s => s.gender === 'Male').length;
  const femaleStudents = students.filter(s => s.gender === 'Female').length;
  const newAdmissions = students.filter(s => s.studentType === 'New').length;
  const oldStudents = students.filter(s => s.studentType === 'Old').length;

  return (
    <div className="space-y-6">
      {/* Student Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Total Students Card */}
        <Card className="border-blue-300 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Students</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalStudents}</div>
            <p className="text-xs text-blue-100">Total number of students enrolled.</p>
          </CardContent>
        </Card>

        {/* Male Students Card */}
        <Card className="border-cyan-300 bg-gradient-to-br from-cyan-400 to-cyan-600 dark:from-cyan-500 dark:to-cyan-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Male Students</CardTitle>
            <User className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{maleStudents}</div>
            <p className="text-xs text-cyan-100">Male students.</p>
          </CardContent>
        </Card>

        {/* Female Students Card */}
        <Card className="border-pink-300 bg-gradient-to-br from-pink-400 to-pink-600 dark:from-pink-500 dark:to-pink-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Female Students</CardTitle>
            <User className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{femaleStudents}</div>
            <p className="text-xs text-pink-100">Female students.</p>
          </CardContent>
        </Card>

        {/* New Admissions Card */}
        <Card className="border-green-300 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">New Admissions</CardTitle>
            <UserPlus className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{newAdmissions}</div>
            <p className="text-xs text-green-100">Total New Students admitted this term.</p>
          </CardContent>
        </Card>

        {/* Old Students Card */}
        <Card className="border-purple-300 bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Old Students</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{oldStudents}</div>
            <p className="text-xs text-purple-100">Total number of continuing students.</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <div className="grid flex-1 items-start gap-4 md:gap-8">
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
