import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, TrendingUp, Award, User, UserCheck } from "lucide-react"

interface AdmissionStatsCardsProps {
  totalStudents: number
  newAdmissions: number
  maleStudents: number
  femaleStudents: number
  malePercentage: number
  femalePercentage: number
  topEnrollmentClass: [string, number] | undefined
  mostAdmissionsClass: [string, number] | undefined
}

export default function AdmissionStatsCards({
  totalStudents,
  newAdmissions,
  maleStudents,
  femaleStudents,
  malePercentage,
  femalePercentage,
  topEnrollmentClass,
  mostAdmissionsClass
}: AdmissionStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* Total Students Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Students</CardTitle>
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalStudents}</div>
          <p className="text-xs text-blue-600 dark:text-blue-400">Across all classes</p>
        </CardContent>
      </Card>
      
      {/* New Admissions Card */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">New Admissions</CardTitle>
          <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800 dark:text-green-200">{newAdmissions}</div>
          <p className="text-xs text-green-600 dark:text-green-400">This academic term</p>
        </CardContent>
      </Card>
      
      {/* Male Students Card */}
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-300">Male Students</CardTitle>
          <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sky-800 dark:text-sky-200">{maleStudents}</div>
          <p className="text-xs text-sky-600 dark:text-sky-400">{malePercentage}% of total</p>
        </CardContent>
      </Card>
      
      {/* Female Students Card */}
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-300">Female Students</CardTitle>
          <UserCheck className="h-4 w-4 text-pink-600 dark:text-pink-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-800 dark:text-pink-200">{femaleStudents}</div>
          <p className="text-xs text-pink-600 dark:text-pink-400">{femalePercentage}% of total</p>
        </CardContent>
      </Card>
      
      {/* Top Enrollment Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Top Enrollment</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{topEnrollmentClass?.[0] || 'N/A'}</div>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            {topEnrollmentClass?.[1] || 0} students
          </p>
        </CardContent>
      </Card>
      
      {/* Most Admissions Card */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Most Admissions</CardTitle>
          <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">{mostAdmissionsClass?.[0] || 'N/A'}</div>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {mostAdmissionsClass?.[1] || 0} new students
          </p>
        </CardContent>
      </Card>
    </div>
  )
}