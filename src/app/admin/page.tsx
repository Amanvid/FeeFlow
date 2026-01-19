
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllStudents, getTeacherUsers, getNonTeacherUsers } from "@/lib/data";
import { cn } from "@/lib/utils";
import ClassEnrollmentChart from "@/components/admin/charts/class-enrollment-chart";
import StaffStatusPieChart from "@/components/admin/staff-status-pie-chart";
import GenderPieChart from "@/components/admin/gender-pie-chart";

export default async function AdminDashboard() {
  const students = await getAllStudents();
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
        {/* Admission Fees Excluding Books & Uniforms */}
        <StatCard
          title="Admission - Students Books"
          value={`GH₵${admissionStudentsBooks.toLocaleString()}`}
          description={`${newAdmissions} New Students (books included in admission)`}
          className="bg-cyan-600"
        />
        <StatCard
          title="Old student Books fees"
          value={`GH₵${oldStudentsBooks.toLocaleString()}`}
          description="Sum of all books fee payments from Old Students."
          className="bg-teal-600"
        />
        <StatCard
          title="Admission Fees (Excl. Books & Uniforms)"
          value={`GH₵${admissionFeesExcludingBooksAndUniforms.toLocaleString()}`}
          description={`${newAdmissions} New Students - Admission fees only (excludes books & GH₵300 uniform per Student)`}
          className="bg-purple-600"
        />

        {/* Uniform Fees */}
        <StatCard
          title="New Students Uniform Fees Collected"
          value={`GH₵${totalUniformFees.toLocaleString()}`}
          description={`${newAdmissions} New Students × GH₵300 per uniform`}
          className="bg-orange-600"
        />

        {/* New Admissions Statistics Card - REMOVED */}

        {/* New Students Gender Breakdown - REMOVED */}

        {/* New Students Fees Collection - REMOVED */}


        {/* Student Payment Status - REMOVED PAYMENT STATUS CARDS */}

      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        {/* Student Demographics */}
        <StatCard
          title="Total Students"
          value={totalStudents}
          description="Total number of students enrolled."
          className="bg-slate-700"
        />
        <StatCard
          title="New Admissions"
          value={newAdmissions}
          description="Total New Students admitted this term."
          className="bg-fuchsia-500"
        />
        <StatCard
          title="Old Students"
          value={oldStudents}
          description="Total number of continuing students."
          className="bg-lime-600"
        />

        {/* Staff Statistics */}
        <StatCard
          title="Total Staff"
          value={totalStaff}
          description="All teaching and non-teaching staff."
          className="bg-amber-600"
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
