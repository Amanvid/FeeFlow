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

  const normalizeGroup = (c?: string) => {
    const n = (c || '').toLowerCase().trim()
    if (n === 'creche') return 'Creche'
    if (n.startsWith('nursery')) return 'Nursery 1 & 2'
    if (n.startsWith('kg')) return 'KG 1 & 2'
    if (n.startsWith('bs')) return 'BS 1 to 6'
    return ''
  }
  const deriveTermLabel = (value?: string) => {
    const raw = String(value || '').toLowerCase().trim()
    if (!raw) return ''
    if (raw.startsWith('first') || /^1st/.test(raw)) return 'Term 1'
    if (raw.startsWith('second') || /^2nd/.test(raw)) return 'Term 2'
    if (raw.startsWith('third') || /^3rd/.test(raw)) return 'Term 3'
    return value || ''
  }
  const group = normalizeGroup(effectiveClass)
  const totalScoresByGroup = sbaConfig?.totalScoresByGroup || {}
  const classTotalMax = group && totalScoresByGroup[group] ? Number(totalScoresByGroup[group]) : 0

  // Compute highest student total (sum across subjects for class)
  let highestAggregatedTotal = 0
  try {
    const subjectsRes = await fetch(`${baseUrl}/api/sba/class-subjects?className=${encodeURIComponent(effectiveClass)}`, { cache: 'no-store' })
    let subjectsList: string[] = []
    if (subjectsRes.ok) {
      const js = await subjectsRes.json()
      subjectsList = Array.isArray(js.subjects) ? js.subjects : []
    }
    if (subjectsList.length === 0) {
      const n = effectiveClass.trim()
      if (n === 'BS 1' || n === 'BS 2' || n === 'BS 3' || n === 'BS 4' || n === 'BS 5') {
        subjectsList = ['English', 'Mathematics', 'Science', 'Computing', 'History', 'R.M.E', 'Asante - Twi', 'Creative Arts']
      }
    }
    const termLabel = deriveTermLabel(sbaConfig?.termName) || 'Term 1'
    const totalsMap = new Map<string, number>()
    for (const subj of subjectsList) {
      const qs = new URLSearchParams({ className: effectiveClass, subject: subj, term: termLabel }).toString()
      const res = await fetch(`${baseUrl}/api/sba/class-assessment?${qs}`, { cache: 'no-store' })
      if (!res.ok) continue
      const json = await res.json()
      const rows: any[] = Array.isArray(json.records) ? json.records : []
      for (const r of rows) {
        const name = String(r.studentName || '').trim()
        const total = Number(r.overallTotal || 0)
        if (!name) continue
        const prev = totalsMap.get(name) || 0
        totalsMap.set(name, prev + (Number.isFinite(total) ? total : 0))
      }
    }
    highestAggregatedTotal = Math.max(0, ...Array.from(totalsMap.values()))
  } catch {}

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <div>
              <div className="text-sm text-muted-foreground">Total Class Subjects Score</div>
              <div className="font-semibold">{classTotalMax || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Class</div>
              <div className="font-semibold">{className || student.class}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Highest Student Total</div>
              <div className="font-semibold">{Math.round(highestAggregatedTotal)}</div>
            </div>
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
