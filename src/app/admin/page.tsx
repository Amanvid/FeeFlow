
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllStudents, getTeacherUsers, getNonTeacherUsers } from "@/lib/data";
import { NEW_METADATA, OLD_METADATA } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import ClassEnrollmentChart from "@/components/admin/charts/class-enrollment-chart";
import StaffStatusPieChart from "@/components/admin/staff-status-pie-chart";
import GenderPieChart from "@/components/admin/gender-pie-chart";

export default async function AdminDashboard() {
  const [newStudentsMeta, oldStudentsMeta] = await Promise.all([
    getAllStudents(NEW_METADATA),
    getAllStudents(OLD_METADATA)
  ]);
  const students = [...newStudentsMeta, ...oldStudentsMeta];
  const teachers = await getTeacherUsers();
  const nonTeachers = await getNonTeacherUsers();

  // Corrected: Calculate total outstanding balance from the students data source of truth.
  const totalBalanceDue = students.reduce((acc, student) => acc + student.balance, 0);

  const UNIFORM_COST = 300;

  const totalBooksPaid = students.reduce((acc, student) => acc + student.booksFeePaid, 0);
  const totalPaidOverall = students.reduce((acc, student) => acc + student.amountPaid, 0);

  // Books price by class - calculate this first so we can use it for new students
  const booksPriceByClass = students.reduce((acc, student) => {
    if (student.class && student.books > 0) {
      acc[student.class] = student.books; // Assuming books fee is consistent per class
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate admission students books fees based on class books price (like books page)
  const admissionStudentsBooks = students
    .filter(student => student.studentType === 'New')
    .reduce((sum, student) => {
      // For new students, get the book price from their class configuration
      // since books are included in admission fees and their individual books field might be 0
      const classBookPrice = booksPriceByClass[student.class] || 0;
      return sum + classBookPrice;
    }, 0);

  // Calculate old students books fees (old students with books payments)
  const oldStudentsBooks = students
    .filter(s => s.studentType === 'Old')
    .reduce((acc, student) => acc + student.booksFeePaid, 0);

  // Get new students only
  const newStudents = students.filter(student => student.studentType === 'New');

  // Calculate books fees for new students (based on existing class book prices)
  const admittedStudentBooksFees = newStudents.reduce((sum, student) => {
    const classBookPrice = booksPriceByClass[student.class] || 0;
    return sum + classBookPrice;
  }, 0);

  const admittedStudentUniformsFees = newStudents.length * UNIFORM_COST;

  // Admission fees excluding books and uniforms (same logic as admissions page)
  // fees paid - uniform - sum of class book price per each student
  const admissionFeesExcludingBooksAndUniforms = newStudents
    .reduce((sum, student) => sum + student.amountPaid, 0) - admittedStudentUniformsFees - admittedStudentBooksFees;

  // Total School Fees Collected (excluding books AND uniforms)
  // For old students: just schoolFeesPaid (already excludes books)
  // For new students: schoolFeesPaid minus uniform cost (GH₵300)
  const totalFeesPaid = students.reduce((acc, student) => {
    if (student.studentType === 'New') {
      // New students: exclude uniform cost from their school fees paid
      return acc + (student.schoolFeesPaid - UNIFORM_COST);
    } else {
      // Old students: schoolFeesPaid already excludes books
      return acc + student.schoolFeesPaid;
    }
  }, 0);

  // Calculate total uniform fees collected (GH₵300 per new student)
  const totalUniformFees = students
    .filter(student => student.studentType === 'New')
    .reduce((sum, student) => sum + UNIFORM_COST, 0);


  const maleStudents = students.filter(s => s.gender === 'Male').length;
  const femaleStudents = students.filter(s => s.gender === 'Female').length;
  const totalStudents = students.length;

  const fullyPaidStudents = students.filter(s => s.balance <= 0).length;
  const partiallyPaidStudents = students.filter(s => s.balance > 0 && s.amountPaid > 0).length;
  const owingStudents = students.filter(s => s.balance > 0).length;

  const newAdmissions = students.filter(s => s.studentType === 'New').length;
  const oldStudents = students.filter(s => s.studentType === 'Old').length;

  const activeTeachers = teachers.filter(t => t.status === "active").length;
  const activeNonTeachers = nonTeachers.filter(n => n.status === "active").length;
  const totalStaff = teachers.length + nonTeachers.length;

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

  // Calculate Top Enrollment Class (class with most total students)
  const topEnrollmentClass = chartData.reduce((max, item) =>
    item.students > max.students ? item : max,
    chartData[0] || { name: "N/A", students: 0 }
  );

  // Calculate Most Admission Class (class with most new admissions)
  const newAdmissionsByClass = newStudents.reduce((acc, student) => {
    if (student.class) {
      acc[student.class] = (acc[student.class] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const admissionChartData = Object.entries(newAdmissionsByClass)
    .map(([name, count]) => ({ name, admissions: count }))
    .sort((a, b) => {
      const indexA = classOrder.indexOf(a.name);
      const indexB = classOrder.indexOf(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  const mostAdmissionClass = admissionChartData.reduce((max, item) =>
    item.admissions > max.admissions ? item : max,
    admissionChartData[0] || { name: "N/A", admissions: 0 }
  );

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {/* Financial Overview */}
        <StatCard
          title="Total Collected (Overall)"
          value={`GH₵${totalPaidOverall.toLocaleString()}`}
          description="Sum of all Old and New Student School fees and book payments."
          className="bg-green-600"
        />
        <StatCard
          title="Total School Fees Collected"
          value={`GH₵${totalFeesPaid.toLocaleString()}`}
          description="Sum of all Old and New Student School fee payments (excluding books & uniforms)."
          className="bg-sky-600"
        />
        <StatCard
          title="Total Outstanding"
          value={`GH₵${totalBalanceDue.toLocaleString()}`}
          description="Sum of all outstanding balances."
          className="bg-red-500"
        />

      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        {/* Row 1: Detailed Financial Breakdown */}
        <SmallStatCard
          title="Admission Fees"
          value={`GH₵${admissionFeesExcludingBooksAndUniforms.toLocaleString()}`}
          description={`From ${newAdmissions} new students`}
          className="bg-purple-600"
        />
        <SmallStatCard
          title="Old Student Fees"
          value={`GH₵${students.filter(s => s.studentType === 'Old').reduce((acc, s) => acc + s.schoolFeesPaid, 0).toLocaleString()}`}
          description={`From ${oldStudents} old students`}
          className="bg-indigo-600"
        />
        <SmallStatCard
          title="Books (Both)"
          value={`GH₵${totalBooksPaid.toLocaleString()}`}
          description="New and old students"
          className="bg-cyan-600"
        />
        <SmallStatCard
          title="Uniforms (Both)"
          value={`GH₵${totalUniformFees.toLocaleString()}`}
          description={`${newAdmissions} new students`}
          className="bg-orange-600"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        {/* Row 2: School Fees & Student Counts */}
        <SmallStatCard
          title="School Fees (Both)"
          value={`GH₵${totalFeesPaid.toLocaleString()}`}
          description="Combined school fees"
          className="bg-sky-600"
        />
        <SmallStatCard
          title="Total Students"
          value={totalStudents}
          description="Enrolled students"
          className="bg-slate-700"
        />
        <SmallStatCard
          title="New Students"
          value={newAdmissions}
          description="Admitted this term"
          className="bg-fuchsia-500"
        />
        <SmallStatCard
          title="Old Students"
          value={oldStudents}
          description="Continuing students"
          className="bg-lime-600"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        {/* Row 3: Staff & Enrollment Insights */}
        <SmallStatCard
          title="Total Staff"
          value={totalStaff}
          description="Teaching and non-teaching"
          className="bg-amber-600"
        />
        <SmallStatCard
          title="Top Enrollment Class"
          value={topEnrollmentClass.name}
          description={`${topEnrollmentClass.students} students`}
          className="bg-emerald-600"
        />
        <SmallStatCard
          title="Most Admission Class"
          value={mostAdmissionClass.name}
          description={`${mostAdmissionClass.admissions} new admissions`}
          className="bg-rose-600"
        />
        <SmallStatCard
          title="Empty"
          value="N/A"
          description="Future metric"
          className="bg-gray-400"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 mt-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Student Gender Distribution</CardTitle>
            <CardDescription>Male vs Female students</CardDescription>
          </CardHeader>
          <CardContent>
            <GenderPieChart maleCount={maleStudents} femaleCount={femaleStudents} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Staff Activity Status</CardTitle>
            <CardDescription>Active teachers vs non-teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffStatusPieChart
              activeTeachersCount={activeTeachers}
              activeNonTeachersCount={activeNonTeachers}
            />
          </CardContent>
        </Card>

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
    </>
  );
}
