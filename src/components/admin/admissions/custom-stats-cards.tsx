import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, User, UserCheck, TrendingUp, Award } from "lucide-react"

interface CustomStatsCardsProps {
  totalStudents: number
  newAdmissions: number
  maleStudents: number
  femaleStudents: number
  malePercentage: number
  femalePercentage: number
  topEnrollmentClass: [string, number] | undefined
  mostAdmissionsClass: [string, number] | undefined
  totalNewStudentsFees: number
  totalNewStudentsPaid: number
  totalNewStudentsOutstanding: number
  newStudentsFeesCollectionPercentage: number
  admissionFeesExcludingBooksAndUniforms: number
  totalUniformFees: number
  admittedStudentBooksFees: number
  admittedStudentUniformsFees: number
  admittedStudentFeesExclBooksAndUniform: number
}

export default function CustomStatsCards({
  totalStudents,
  newAdmissions,
  maleStudents,
  femaleStudents,
  malePercentage,
  femalePercentage,
  topEnrollmentClass,
  mostAdmissionsClass,
  totalNewStudentsFees,
  totalNewStudentsPaid,
  totalNewStudentsOutstanding,
  newStudentsFeesCollectionPercentage,
  admissionFeesExcludingBooksAndUniforms,
  totalUniformFees,
  admittedStudentBooksFees,
  admittedStudentUniformsFees,
  admittedStudentFeesExclBooksAndUniform
}: CustomStatsCardsProps) {
  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6">
    
      
      {/* New Admissions Card */}
      <Card className="border-green-300 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">New Admissions</CardTitle>
          <UserPlus className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-white">{newAdmissions}</div>
          <p className="text-xs text-green-100">This academic term</p>
        </CardContent>
      </Card>
      
      {/* Male Students Card */}
      <Card className="border-cyan-300 bg-gradient-to-br from-cyan-400 to-cyan-600 dark:from-cyan-500 dark:to-cyan-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Male Students</CardTitle>
          <User className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-white">{maleStudents}</div>
          <p className="text-xs text-cyan-100">{malePercentage}% of new admissions</p>
        </CardContent>
      </Card>
      
      {/* Female Students Card */}
      <Card className="border-rose-300 bg-gradient-to-br from-rose-400 to-rose-600 dark:from-rose-500 dark:to-rose-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Female Students</CardTitle>
          <UserCheck className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-white">{femaleStudents}</div>
          <p className="text-xs text-rose-100">{femalePercentage}% of new admissions</p>
        </CardContent>
      </Card>
      
      {/* Top Enrollment Card */}
      <Card className="border-violet-300 bg-gradient-to-br from-violet-400 to-violet-600 dark:from-violet-500 dark:to-violet-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Top Enrollment</CardTitle>
          <TrendingUp className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{topEnrollmentClass?.[0] || 'N/A'}</div>
          <p className="text-xs text-violet-100">{topEnrollmentClass?.[1] || 0} students</p>
        </CardContent>
      </Card>
      
      {/* Most Admissions Card */}
      <Card className="border-orange-300 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Most Admissions</CardTitle>
          <Award className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{mostAdmissionsClass?.[0] || 'N/A'}</div>
          <p className="text-xs text-orange-100">{mostAdmissionsClass?.[1] || 0} new students</p>
        </CardContent>
      </Card>
    </div>
   

    {/* Fee-Related Cards Section */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Fee Breakdown</h3>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
        {/* New Students Fees Expected */}
        <Card className="border-purple-300 bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">New Students Fees Expected</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">GH₵{totalNewStudentsFees.toLocaleString()}</div>
            <p className="text-xs text-purple-100">Expected from new admissions</p>
          </CardContent>
        </Card>
        
        {/* New Students Fees Collected */}
        <Card className="border-green-300 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">New Students Fees Collected</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">GH₵{totalNewStudentsPaid.toLocaleString()}</div>
            <p className="text-xs text-green-100">{newStudentsFeesCollectionPercentage}% collection rate</p>
          </CardContent>
        </Card>
       
        
      </div>
    </div>

    {/* Outstanding Admission Fees and Admitted Student Fees Row */}
    <div className="grid gap-4 md:grid-cols-4">

       {/* Admitted Student Fees (Excl. Books & Uniform) Card */}
      <Card className="border-indigo-300 bg-gradient-to-br from-indigo-400 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Admitted Student Fees (Excl. Books & Uniform)</CardTitle>
          <TrendingUp className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-white">GH₵{admittedStudentFeesExclBooksAndUniform.toLocaleString()}</div>
          <p className="text-xs text-indigo-100">Collected admission fees only</p>
        </CardContent>
      </Card>

        
        {/* Admitted Student Books Fees */}
        <Card className="border-blue-300 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Admitted Student Books Fees</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">GH₵{admittedStudentBooksFees.toLocaleString()}</div>
            <p className="text-xs text-blue-100">Books for {newAdmissions} students</p>
          </CardContent>
        </Card>
        
        {/* Admitted Student Uniforms Fees */}
        <Card className="border-orange-300 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Admitted Student Uniforms Fees</CardTitle>
            <Award className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">GH₵{admittedStudentUniformsFees.toLocaleString()}</div>
            <p className="text-xs text-orange-100">{newAdmissions} uniforms × GH₵300</p>
          </CardContent>
        </Card>
      {/* Outstanding Admission Fees Card */}
      <Card className="border-red-300 bg-gradient-to-br from-red-400 to-red-600 dark:from-red-500 dark:to-red-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Outstanding Admission Fees</CardTitle>
          <Users className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-white">GH₵{totalNewStudentsOutstanding.toLocaleString()}</div>
          <p className="text-xs text-red-100">Pending from new admissions</p>
        </CardContent>
      </Card>
      
      
    </div>
  </div>
  )
}