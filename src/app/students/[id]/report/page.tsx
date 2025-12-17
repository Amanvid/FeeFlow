'use server'

import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ClientReport from './report-client'
import ClassRankingModal from './class-ranking-modal'
import { getSBAConfig } from '@/lib/sba-config'
import { getAllStudents } from '@/lib/data'
import { getSBAClassAssessment, getAvailableSubjectsForClass } from '@/lib/sba-assessment'

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

  const chosenSubject = summaries[0]?.subject || 'Literacy'
  const chosenTerm = summaries[0]?.term || 'Term 1'
  const subjectsList = await getAvailableSubjectsForClass(effectiveClass, chosenTerm)
  const totalsMap = new Map<string, { name: string; total: number; subjectCount: number }>()
  let rankingRecords: Array<{ id: string; studentName: string; overallTotal: number; position: number; subjectCount: number }> = []
  if (subjectsList.length > 0) {
    for (const subj of subjectsList) {
      const data = await getSBAClassAssessment(effectiveClass, subj, chosenTerm)
      const recs = data?.records || []
      for (const r of recs) {
        const name = String(r.studentName || '').trim()
        if (!name || name.toLowerCase() === 'student name') continue
        const toNum = (v: unknown) => {
          if (typeof v === 'number') return v
          const n = Number(String(v ?? '').trim())
          return Number.isFinite(n) ? n : 0
        }
        const overall = toNum(r.overallTotal)
        const scaledClass = toNum(r.scaledClassScore)
        const scaledExam = toNum(r.scaledExamScore)
        const totalClassRaw = toNum(r.totalClassScore)
        const examRaw = toNum(r.examScore)
        const scaledClassCalc = scaledClass || (totalClassRaw > 0 ? Math.round(Math.min(60, totalClassRaw) / 60 * 50) : 0)
        const scaledExamCalc = scaledExam || (examRaw > 0 ? Math.round(Math.min(100, examRaw) / 100 * 50) : 0)
        const val = overall || (scaledClassCalc + scaledExamCalc)
        const prev = totalsMap.get(name) || { name, total: 0, subjectCount: 0 }
        totalsMap.set(name, { name, total: prev.total + (Number.isFinite(val) ? val : 0), subjectCount: prev.subjectCount + 1 })
      }
    }
    rankingRecords = Array.from(totalsMap.values()).map((row) => ({
      id: row.name,
      studentName: row.name,
      overallTotal: row.total,
      position: 0,
      subjectCount: row.subjectCount
    }))
  } else {
    const single = await getSBAClassAssessment(effectiveClass, chosenSubject, chosenTerm)
    const recs = single?.records || []
    rankingRecords = recs
      .filter((r) => String(r.studentName || '').trim().toLowerCase() !== 'student name')
      .map((r) => {
        const toNum = (v: unknown) => {
          if (typeof v === 'number') return v
          const n = Number(String(v ?? '').trim())
          return Number.isFinite(n) ? n : 0
        }
        const overall = toNum(r.overallTotal)
        const scaledClass = toNum(r.scaledClassScore)
        const scaledExam = toNum(r.scaledExamScore)
        const totalClassRaw = toNum(r.totalClassScore)
        const examRaw = toNum(r.examScore)
        const scaledClassCalc = scaledClass || (totalClassRaw > 0 ? Math.round(Math.min(60, totalClassRaw) / 60 * 50) : 0)
        const scaledExamCalc = scaledExam || (examRaw > 0 ? Math.round(Math.min(100, examRaw) / 100 * 50) : 0)
        const val = overall || (scaledClassCalc + scaledExamCalc)
        return {
          id: String(r.id),
          studentName: String(r.studentName || ''),
          overallTotal: Number.isFinite(val) ? val : 0,
          position: 0,
          subjectCount: 1
        }
      })
  }
  const grp = (() => {
    const n = (effectiveClass || '').trim().toLowerCase()
    if (n === 'creche') return 'Creche'
    if (n.startsWith('nursery')) return 'Nursery 1 & 2'
    if (n.startsWith('kg')) return 'KG 1 & 2'
    if (n.startsWith('bs')) return 'BS 1 to 6'
    return ''
  })()
  const configuredMax =
    (grp && sbaConfig?.totalScoreByGroup && sbaConfig.totalScoreByGroup[grp]) ? sbaConfig.totalScoreByGroup[grp] : 0
  const subjectsCount = subjectsList.length > 0 ? subjectsList.length : (rankingRecords[0]?.subjectCount || 1)
  const inferredMax = subjectsCount > 0 ? subjectsCount * 100 : 100
  const totalMaxFromConfig = configuredMax > 0 ? configuredMax : inferredMax

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button asChild variant="outline">
          <a href="/teacher/sba-assessment" className="flex items-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Class Subjects Score</div>
              <div className="font-semibold">400</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Class</div>
              <div className="font-semibold">Nursery 1</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Highest Student Total</div>
              <div className="font-semibold">261</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <ClassRankingModal
          className={effectiveClass}
          subject={subjectsList.length > 0 ? chosenSubject : chosenSubject}
          totalMax={totalMaxFromConfig}
          records={rankingRecords}
        />
      </div>
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
