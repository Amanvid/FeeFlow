
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllClaims, getAllStudents, getTotalStudentsCount } from "@/lib/data";
import ClaimsTable from "@/components/admin/claims-table";
import { cn } from "@/lib/utils";
import ClassEnrollmentChart from "@/components/admin/charts/class-enrollment-chart";

export default async function AdminDashboard() {
  const claims = await getAllClaims();
  const students = await getAllStudents();
  const totalStudents = await getTotalStudentsCount(); // Get accurate count from Google Sheet

  const totalClaims = claims.length;
  // Corrected: Calculate total outstanding balance from the students data source of truth.
  const totalBalanceDue = students.reduce((acc, student) => acc + student.balance, 0);
  
  const totalFeesPaid = students.reduce((acc, student) => acc + student.schoolFeesPaid, 0);
  const totalBooksPaid = students.reduce((acc, student) => acc + student.booksFeePaid, 0);
  const totalPaidOverall = students.reduce((acc, student) => acc + student.amountPaid, 0);


  const maleStudents = students.filter(s => s.gender === 'Male').length;
  const femaleStudents = students.filter(s => s.gender === 'Female').length;

  const fullyPaidStudents = students.filter(s => s.balance <= 0).length;
  const partiallyPaidStudents = students.filter(s => s.balance > 0 && s.amountPaid > 0).length;
  const owingStudents = students.filter(s => s.balance > 0).length;

  const newAdmissions = students.filter(s => s.studentType === 'New').length;
  const oldStudents = students.filter(s => s.studentType === 'Old').length;

  // Process data for chart
  const classEnrollment = students.reduce((acc, student) => {
    if (student.class) {
      acc[student.class] = (acc[student.class] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const classOrder = ["Creche", "Nursery 1", "Nursery 2", "KG 1", "KG 2", "BS 1", "BS 2", "BS 3", "BS 4", "BS 5", "BS 6"];

  const chartData = Object.entries(classEnrollment)
    .map(([name, count]) => ({ name, students: count }))
    .sort((a, b) => {
      const indexA = classOrder.indexOf(a.name);
      const indexB = classOrder.indexOf(b.name);
      // Handle cases where a class might not be in the predefined order
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  const StatCard = ({ title, value, description, className, icon: Icon }: { title: string, value: string | number, description: string, className?: string, icon?: React.ElementType }) => (
    <Card className={cn("text-white", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="text-white/80">{title}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-white/80">
          {description}
        </div>
      </CardContent>
    </Card>
  );

  const SmallStatCard = ({ title, value, description, className }: { title: string, value: string | number, description: string, className?: string }) => (
    <Card className={cn("text-white", className)}>
      <CardHeader className="p-4 pb-2">
        <CardDescription className="text-white/80 text-xs">{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs text-white/80">
          {description}
        </div>
      </CardContent>
    </Card>
  );


  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Financial Overview */}
        <StatCard 
          title="Total Invoices" 
          value={totalClaims} 
          description="Total number of fee checks made."
          className="bg-blue-500"
        />
        <StatCard 
          title="Total Collected (Overall)" 
          value={`GH₵${totalPaidOverall.toLocaleString()}`}
          description="Sum of all fee and book payments."
          className="bg-green-600"
        />
         <StatCard 
          title="Total School Fees Collected" 
          value={`GH₵${totalFeesPaid.toLocaleString()}`}
          description="Sum of all school fee payments (excluding books)."
          className="bg-sky-600"
        />
        <StatCard 
          title="Total Books Fees Collected" 
          value={`GH₵${totalBooksPaid.toLocaleString()}`}
          description="Sum of all book fee payments."
          className="bg-cyan-600"
        />
        <StatCard 
          title="Total Outstanding" 
          value={`GH₵${totalBalanceDue.toLocaleString()}`}
          description="Sum of all outstanding balances."
          className="bg-red-500"
        />
        
        {/* Student Payment Status */}
        <StatCard 
          title="Total Owing Students" 
          value={owingStudents} 
          description="Students with a balance > 0."
          className="bg-orange-500"
        />
        <StatCard 
          title="Fully Paid Students" 
          value={fullyPaidStudents} 
          description="Students with zero balance."
          className="bg-teal-500"
        />
        <StatCard 
          title="Partially Paid Students" 
          value={partiallyPaidStudents} 
          description="Students who have paid some fees but still have a balance."
          className="bg-purple-500"
        />

        {/* Student Demographics */}
         <StatCard 
          title="Total Students" 
          value={totalStudents} 
          description="Total number of students enrolled."
          className="bg-slate-700"
        />
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
          <SmallStatCard 
            title="Male Students" 
            value={maleStudents} 
            description="Male students."
            className="bg-indigo-500"
          />
          <SmallStatCard 
            title="Female Students" 
            value={femaleStudents} 
            description="Female students."
            className="bg-pink-500"
          />
        </div>
        <StatCard 
          title="New Admissions" 
          value={newAdmissions} 
          description="Total number of new students."
          className="bg-fuchsia-500"
        />
        <StatCard 
          title="Old Students" 
          value={oldStudents} 
          description="Total number of returning students."
          className="bg-lime-600"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Class Enrollment</CardTitle>
            <CardDescription>Number of students in each class.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ClassEnrollmentChart data={chartData} />
          </CardContent>
        </Card>
      </div>
      <ClaimsTable claims={claims} />
    </>
  );
}
