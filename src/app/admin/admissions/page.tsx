import { getAllStudents } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, TrendingUp, Award } from "lucide-react"
import CustomStatsCards from "@/components/admin/admissions/custom-stats-cards"
import ClassEnrollmentChart from "@/components/admin/admissions/class-enrollment-chart"
import NewStudentsTable from "@/components/admin/admissions/new-students-table"
import NewStudentModal from "@/components/admin/admissions/new-student-modal"

export default async function AdmissionsDashboard() {
  const students = await getAllStudents();
  
  // Calculate statistics based on requirements
  const totalStudents = students.length
  const newAdmissions = students.filter(student => student.studentType === 'New').length
  
  // Gender statistics (only for new admissions)
  const newAdmissionsStudents = students.filter(student => student.studentType === 'New')
  const maleStudents = newAdmissionsStudents.filter(student => student.gender === 'Male').length
  const femaleStudents = newAdmissionsStudents.filter(student => student.gender === 'Female').length
  const newAdmissionsTotal = newAdmissionsStudents.length
  const malePercentage = newAdmissionsTotal > 0 ? Math.round((maleStudents / newAdmissionsTotal) * 100) : 0
  const femalePercentage = newAdmissionsTotal > 0 ? Math.round((femaleStudents / newAdmissionsTotal) * 100) : 0
  
  // Class enrollment statistics
  const classEnrollment = students.reduce((acc, student) => {
    acc[student.class] = (acc[student.class] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // New admissions by class
  const newAdmissionsByClass = students
    .filter(student => student.studentType === 'New')
    .reduce((acc, student) => {
      acc[student.class] = (acc[student.class] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  // Find top enrollment class (handle ties)
  const sortedEnrollment = Object.entries(classEnrollment)
    .sort(([,a], [,b]) => b - a)
  
  // Find all classes with the highest enrollment (handle ties)
  const maxEnrollment = sortedEnrollment[0]?.[1] || 0
  const topEnrollmentClasses = sortedEnrollment
    .filter(([,count]) => count === maxEnrollment)
    .map(([className, count]) => [className, count] as [string, number])
  
  // Format for display: show all tied classes
  const topEnrollmentClass = topEnrollmentClasses.length > 1 
    ? [`${topEnrollmentClasses.map(([name]) => name).join(' & ')}`, maxEnrollment] as [string, number]
    : topEnrollmentClasses[0] || undefined
  
  // Find most admissions class (handle ties)
  const sortedAdmissions = Object.entries(newAdmissionsByClass)
    .sort(([,a], [,b]) => b - a)
  
  const maxAdmissions = sortedAdmissions[0]?.[1] || 0
  const topAdmissionsClasses = sortedAdmissions
    .filter(([,count]) => count === maxAdmissions)
    .map(([className, count]) => [className, count] as [string, number])
  
  // Format for display: show all tied classes
  const mostAdmissionsClass = topAdmissionsClasses.length > 1
    ? [`${topAdmissionsClasses.map(([name]) => name).join(' & ')}`, maxAdmissions] as [string, number]
    : topAdmissionsClasses[0] || undefined
  
  // New students list
  const newStudents = students.filter(student => student.studentType === 'New')
  
  // New students fees calculations - Restructured breakdown
  const UNIFORM_COST = 300;
  
  // 1. Total admission fees (expected from new students)
  const totalNewStudentsFees = newStudents.reduce((sum, student) => sum + student.fees, 0)
  
  // 2. Books price by class - calculate from all students to get class-based book prices
  const booksPriceByClass = students.reduce((acc, student) => {
    if (student.class && student.books > 0) {
      acc[student.class] = student.books; // Use the books fee for this class
    }
    return acc;
  }, {} as Record<string, number>);
  
  // 3. Admitted student books fees (calculated based on class book prices)
  const admittedStudentBooksFees = newStudents.reduce((sum, student) => {
    const classBookPrice = booksPriceByClass[student.class] || 0;
    return sum + classBookPrice;
  }, 0)
  
  // 4. Admitted student uniforms fees (GH₵300 per student)
  const admittedStudentUniformsFees = newStudents.length * UNIFORM_COST
  
  // 5. Total amount paid by new students
  const totalNewStudentsPaid = newStudents.reduce((sum, student) => sum + student.amountPaid, 0)
  
  // 6. Outstanding fees (balance remaining)
  const totalNewStudentsOutstanding = newStudents.reduce((sum, student) => sum + student.balance, 0)
  
  // 7. Collection percentage
  const newStudentsFeesCollectionPercentage = totalNewStudentsFees > 0 ? 
    Math.round((totalNewStudentsPaid / totalNewStudentsFees) * 100) : 0

  // 8. Admission fees excluding books and uniforms (for reference)
  const admissionFeesExcludingBooksAndUniforms = newStudents
    .reduce((sum, student) => {
      // For new students: amountPaid - booksFeePaid - uniformCost
      const admissionFeeOnly = Math.max(0, student.amountPaid - student.booksFeePaid - UNIFORM_COST);
      return sum + admissionFeeOnly;
    }, 0);

  // 9. Uniform fees collected (same as admittedStudentUniformsFees)
  const totalUniformFees = admittedStudentUniformsFees;

  // 10. Admitted student fees excluding books and uniforms (based on collected admission fees)
  const admittedStudentFeesExclBooksAndUniform = totalNewStudentsPaid - admittedStudentBooksFees - admittedStudentUniformsFees;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admissions Dashboard</h1>
        <NewStudentModal classes={Object.keys(classEnrollment)} />
      </div>

      {/* Statistics Cards */}
      <CustomStatsCards 
        totalStudents={totalStudents}
        newAdmissions={newAdmissions}
        maleStudents={maleStudents}
        femaleStudents={femaleStudents}
        malePercentage={malePercentage}
        femalePercentage={femalePercentage}
        topEnrollmentClass={topEnrollmentClass}
        mostAdmissionsClass={mostAdmissionsClass}
        totalNewStudentsFees={totalNewStudentsFees}
        newStudentsFeesCollectionPercentage={newStudentsFeesCollectionPercentage}
        totalNewStudentsPaid={totalNewStudentsPaid}
        totalNewStudentsOutstanding={totalNewStudentsOutstanding}
        admissionFeesExcludingBooksAndUniforms={admissionFeesExcludingBooksAndUniforms}
        totalUniformFees={totalUniformFees}
        admittedStudentBooksFees={admittedStudentBooksFees}
        admittedStudentUniformsFees={admittedStudentUniformsFees}
        admittedStudentFeesExclBooksAndUniform={admittedStudentFeesExclBooksAndUniform}
      />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollment">Class Enrollment</TabsTrigger>
          <TabsTrigger value="new-admissions">New Admissions</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Comparison Overview Section */}
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
            <CardHeader>
              <CardTitle className="text-indigo-800 dark:text-indigo-200">Comparison Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ClassEnrollmentChart 
                classEnrollment={classEnrollment}
                newAdmissionsByClass={newAdmissionsByClass}
                showComparison={true}
                totalStudents={totalStudents}
              />
            </CardContent>
          </Card>
          
          {/* New Admissions Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
              <CardContent className="pt-6">
                <ClassEnrollmentChart 
                  classEnrollment={classEnrollment}
                  newAdmissionsByClass={newAdmissionsByClass}
                  showNewOnly={true}
                  totalStudents={totalStudents}
                />
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">New Students This Year</CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400">New students admitted this academic term</CardDescription>
              </CardHeader>
              <CardContent>
                <NewStudentsTable students={newStudents} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Enrollment Details</CardTitle>
              <CardDescription>Total students in each class</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassEnrollmentChart 
                classEnrollment={classEnrollment}
                newAdmissionsByClass={newAdmissionsByClass}
                showComparison={false}
                totalStudents={totalStudents}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new-admissions" className="space-y-4">
          <Card>
            <CardContent>
              <ClassEnrollmentChart 
                classEnrollment={classEnrollment}
                newAdmissionsByClass={newAdmissionsByClass}
                showNewOnly={true}
                totalStudents={totalStudents}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardDescription>Comparison of total enrollment and new admissions by class</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassEnrollmentChart 
                classEnrollment={classEnrollment}
                newAdmissionsByClass={newAdmissionsByClass}
                showComparison={true}
                totalStudents={totalStudents}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
