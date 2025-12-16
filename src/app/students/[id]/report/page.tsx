'use server'

import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ClientReport from './report-client'
import { getSBAConfig } from '@/lib/sba-config'
import { getAllStudents } from '@/lib/data'

export default async function StudentReportPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ class?: string; name?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const className = sp?.class
  const studentName = sp?.name

  let student = null
  
  // Get all students
  const allStudents = await getAllStudents()
  
  // If we have a student name parameter, try to find by name first
  if (studentName) {
    const decodedName = decodeURIComponent(studentName)
    student = allStudents.find(s => 
      s.studentName.toLowerCase() === decodedName.toLowerCase() ||
      s.studentName.toLowerCase().includes(decodedName.toLowerCase()) ||
      decodedName.toLowerCase().includes(s.studentName.toLowerCase())
    )
  }
  
  // If still not found and the ID looks like an SBA ID (class-rowNumber format)
  if (!student && /^[a-zA-Z0-9]+-\d+$/.test(id)) {
    // Extract class and row number from SBA ID
    const parts = id.split('-')
    const classPrefix = parts[0].toUpperCase()
    const rowNumber = parts[1]
    
    // Find student that matches the row number and class
    student = allStudents.find(s => {
      // Extract row number from the complex ID (format: rowNumber-nameHash-index)
      const studentIdParts = s.id.split('-')
      if (studentIdParts.length >= 1) {
        const studentRowNumber = studentIdParts[0]
        // Match if row numbers match and class matches
        const normalizedStudentClass = s.class.trim().toUpperCase().replace(/\s+/g, '')
        const normalizedParamClass = (className || '').trim().toUpperCase().replace(/\s+/g, '')
        const normalizedClassPrefix = classPrefix.toUpperCase().replace(/\s+/g, '')
        
        // Match either by class parameter or by extracting class from ID prefix
        const classMatches = normalizedParamClass ? 
          normalizedStudentClass === normalizedParamClass :
          normalizedStudentClass.includes(normalizedClassPrefix)
          
        return studentRowNumber === rowNumber && classMatches
      }
      return false
    })
  } 
  
  // If still not found, try direct ID match
  if (!student) {
    student = allStudents.find(s => s.id === id)
  }
  
  // Last resort: try name-based matching with the ID if it looks like a name
  if (!student) {
    const decodedId = decodeURIComponent(id)
    // Only try this if the ID doesn't look like an SBA ID
    if (!/^[a-zA-Z0-9]+-\d+$/.test(decodedId)) {
      student = allStudents.find(s => 
        s.studentName.toLowerCase().includes(decodedId.toLowerCase()) ||
        decodedId.toLowerCase().includes(s.studentName.toLowerCase().replace(/\s+/g, ''))
      )
    }
  }

  if (!student) {
    console.error('Student not found with ID:', id, 'and name:', studentName)
    return notFound()
  }

  // Use the found student's ID for the API call
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host && host.includes('localhost') ? 'http' : 'https'
  const baseUrl = host ? `${protocol}://${host}` : ''

  const url = className 
    ? `${baseUrl}/api/sba/${encodeURIComponent(student.id)}?class=${encodeURIComponent(className)}` 
    : `${baseUrl}/api/sba/${encodeURIComponent(student.id)}`
  
  const res = await fetch(url, { 
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) return notFound()
  const json = await res.json()
  if (!json.success || !json.student || !json.summary) return notFound()

  const studentData = json.student as {
    id: string
    studentName: string
    class: string
  }
  const summaries = json.summary as Array<{
    subject: string
    term: string
    academicYear: string
    totalAssessments: number
    averageScore: number
    finalGrade: string
    teacherName: string
  }>

  const sbaConfig = await getSBAConfig()
  const effectiveClass = className || studentData.class
  const rollCount = allStudents.filter(
    (s) => (s.class || '').trim().toLowerCase() === (effectiveClass || '').trim().toLowerCase()
  ).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button asChild variant="outline">
          <a href="/dashboard/classes" className="flex items-center">
            ← Back to Classes
          </a>
        </Button>
        <div className="text-lg font-semibold">
          {className || student.class} SBA Assessment
        </div>
        <div></div> {/* Empty div for spacing */}
      </div>
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-sm text-muted-foreground">Student</div>
              <div className="font-semibold">{student.studentName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Class</div>
              <div className="font-semibold">{className || student.class}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Subjects</div>
              <div className="font-semibold">{summaries.length}</div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead className="text-right">Assessments</TableHead>
                  <TableHead className="text-right">Average %</TableHead>
                  <TableHead className="text-right">Final Grade</TableHead>
                  <TableHead>Teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((s, idx) => (
                  <TableRow key={`${s.subject}-${idx}`}>
                    <TableCell className="font-medium">{s.subject}</TableCell>
                    <TableCell>{s.term}</TableCell>
                    <TableCell>{s.academicYear}</TableCell>
                    <TableCell className="text-right">{s.totalAssessments}</TableCell>
                    <TableCell className="text-right">{s.averageScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{s.finalGrade}</TableCell>
                    <TableCell>{s.teacherName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {student && (
        <ClientReport
          studentId={student.id}
          initialClass={effectiveClass}
          sbaConfig={sbaConfig}
          rollCount={rollCount}
        />
      )}
    </div>
  )
}
