import CustomStatsCards from "@/components/admin/admissions/custom-stats-cards"

export default function CustomStatsDemo() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Custom Statistics Dashboard</h1>
        <p className="text-muted-foreground">
          Colorful statistics cards displaying enrollment data
        </p>
      </div>
      
      <CustomStatsCards
        totalStudents={450}
        newAdmissions={32}
        maleStudents={18}
        femaleStudents={14}
        malePercentage={56}
        femalePercentage={44}
        topEnrollmentClass={["Grade 3", 52]}
        mostAdmissionsClass={["Grade 1", 12]}
        totalNewStudentsFees={45000}
        totalNewStudentsPaid={31500}
        totalNewStudentsOutstanding={13500}
        newStudentsFeesCollectionPercentage={70}
        admissionFeesExcludingBooksAndUniforms={22000}
        totalUniformFees={9600}
        admittedStudentBooksFees={5400}
        admittedStudentUniformsFees={9600}
        admittedStudentFeesExclBooksAndUniform={22000}
      />
      
      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
        <p className="font-medium mb-2">Component Usage:</p>
        <p>To use these cards, import and pass the required props:</p>
        <code className="block mt-2 p-2 bg-background rounded border text-xs">
          {`import CustomStatsCards from "@/components/admin/admissions/custom-stats-cards"`}
          <br />
          {`// Then in your JSX:`}
          <br />
          {`<CustomStatsCards totalStudents={450} newAdmissions={32} maleStudents={18} femaleStudents={14} malePercentage={56} femalePercentage={44} topEnrollmentClass={["Grade 3", 52]} mostAdmissionsClass={["Grade 1", 12]} totalNewStudentsFees={45000} totalNewStudentsPaid={31500} totalNewStudentsOutstanding={13500} newStudentsFeesCollectionPercentage={70} admissionFeesExcludingBooksAndUniforms={22000} totalUniformFees={9600} admittedStudentBooksFees={5400} admittedStudentUniformsFees={9600} admittedStudentFeesExclBooksAndUniform={22000} />`}
        </code>
      </div>
    </div>
  )
}