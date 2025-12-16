'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { SchoolConfig } from '@/lib/definitions'
import type { SBAConfig } from '@/lib/sba-config'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'


export default function ClientReport({
  studentId,
  initialClass,
  initialSubject,
  initialTerm,
  sbaConfig,
  rollCount
}: {
  studentId: string
  initialClass?: string
  initialSubject?: string
  initialTerm?: string
  sbaConfig?: SBAConfig
  rollCount?: number
}) {
  // Helper to normalize term labels
  const deriveTermLabel = (value?: string) => {
    const raw = String(value || '').toLowerCase().trim()
    if (!raw) return ''
    if (raw.startsWith('first') || /^1st/.test(raw)) return 'Term 1'
    if (raw.startsWith('second') || /^2nd/.test(raw)) return 'Term 2'
    if (raw.startsWith('third') || /^3rd/.test(raw)) return 'Term 3'
    return value || ''
  }

  // Excel-style banded "position in subject" based on total score
  const getSubjectBandPosition = (score: number): number => {
    if (score > 80) return 1
    if (score > 75) return 2
    if (score > 70) return 3
    if (score > 65) return 4
    if (score > 60) return 5
    if (score > 55) return 6
    if (score > 50) return 7
    if (score > 40) return 8
    if (score > 0) return 9
    return 0
  }

  // Derive an initial term from props/SBA config
  const derivedInitialTerm = initialTerm || deriveTermLabel(sbaConfig?.termName) || 'Term 1'

  const [className, setClassName] = useState(initialClass || '')
  const [subjects, setSubjects] = useState<string[]>([])
  const [subject, setSubject] = useState<string>(initialSubject || '')
  const [term, setTerm] = useState<string>(derivedInitialTerm || 'Term 1')
  const [student, setStudent] = useState<any | null>(null)
  const [assessment, setAssessment] = useState<any | null>(null)
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null)
  const [sba, setSba] = useState<SBAConfig | undefined>(sbaConfig)
  const [subjectRows, setSubjectRows] = useState<Array<{
    subject: string
    classScore: number
    examScore: number
    totalScore: number
    position?: number | string
    grade: string
    remarks: string
  }>>([])

  useEffect(() => {
    const loadStudent = async () => {
      const url = className ? `/api/sba/${studentId}?class=${encodeURIComponent(className)}` : `/api/sba/${studentId}`
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setStudent(json.student || null)
        if (!className) setClassName(json.student?.class || '')
      }
    }
    if (studentId) loadStudent()
  }, [studentId, className])

  useEffect(() => {
    const loadSchoolConfig = async () => {
      const res = await fetch('/api/school-config', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setSchoolConfig(json)
      }
    }
    loadSchoolConfig()
  }, [])
  
  useEffect(() => {
    const loadSBAConfig = async () => {
      if (sba && sba.feesByGroup && Object.keys(sba.feesByGroup).length > 0) return
        const res = await fetch('/api/sba-config', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          setSba(json)
        if (!initialTerm && json?.termName) {
          setTerm((prev) => prev || deriveTermLabel(json.termName))
        }
        }
    }
    loadSBAConfig()
  }, [sba, initialTerm])

  useEffect(() => {
    const loadSubjects = async () => {
      if (!className) return
      const res = await fetch(`/api/sba/class-subjects?className=${encodeURIComponent(className)}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        let list: string[] = Array.isArray(json.subjects) ? json.subjects : []

        // Fallback subjects for BS classes if API returns none
        if (list.length === 0) {
          const n = className.trim()
          if (n === 'BS 1' || n === 'BS 2' || n === 'BS 3' || n === 'BS 4' || n === 'BS 5') {
            list = ['English', 'Mathematics', 'Science', 'Computing', 'History', 'R.M.E', 'Asante - Twi', 'Creative Arts']
          }
        }

        setSubjects(list)
        if (!subject && list.length > 0) setSubject(list[0])
      }
    }
    loadSubjects()
  }, [className])

  useEffect(() => {
    const loadAssessment = async () => {
      if (!studentId || !className || !subject || !term) return
      const qs = new URLSearchParams({ studentId, class: className, subject, term }).toString()
      const res = await fetch(`/api/sba/assessment?${qs}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setAssessment(json.data)
        if (!term && json?.data?.term) {
          setTerm(deriveTermLabel(json.data.term))
        }
      } else {
        setAssessment(null)
      }
    }
    loadAssessment()
  }, [studentId, className, subject, term])

  // If term is still empty but we have SBA config later, fill it
  useEffect(() => {
    if (!term && sba?.termName) {
      setTerm(deriveTermLabel(sba.termName))
    }
  }, [sba?.termName, term])

  useEffect(() => {
    const loadAllSubjectsForStudent = async () => {
      if (!student?.studentName || !className || !term) {
        setSubjectRows([])
        return
      }

      const effectiveSubjects =
        subjects.length > 0
          ? subjects
          : (() => {
              const n = className.trim()
              if (n === 'BS 1' || n === 'BS 2' || n === 'BS 3' || n === 'BS 4' || n === 'BS 5') {
                return ['English', 'Mathematics', 'Science', 'Computing', 'History', 'R.M.E', 'Asante - Twi', 'Creative Arts']
              }
              return []
            })()

      if (effectiveSubjects.length === 0) {
        setSubjectRows([])
        return
      }

      const promises = effectiveSubjects.map(async (subj) => {
        const qs = new URLSearchParams({ className, subject: subj, term }).toString()
        const res = await fetch(`/api/sba/class-assessment?${qs}`, { cache: 'no-store' })
        if (!res.ok) return null
        const json = await res.json()
        const rec = Array.isArray(json.records)
          ? json.records.find((r: any) => String(r.studentName).trim() === String(student.studentName).trim())
          : null
        if (!rec) return null
        const classScore = Number(rec.scaledClassScore || 0)
        const examScore = Number(rec.scaledExamScore || 0)
        const totalScore = Number(rec.overallTotal || (classScore + examScore))
        // Use sheet position if available (handles values like "2" or "2nd"), otherwise compute banded position
        const numericSheetPos = parseInt(String(rec.position ?? '').trim(), 10)
        const position = Number.isFinite(numericSheetPos) && numericSheetPos > 0
          ? numericSheetPos
          : getSubjectBandPosition(totalScore)
        // Grade based on total score (Excel: =IF(Z10>=80,"A",IF(Z10>=70,"B",IF(Z10>=60,"C",IF(Z10>=50,"D",IF(Z10>=1,"E","N/A"))))))
        const grade =
          totalScore >= 80 ? 'A' :
          totalScore >= 70 ? 'B' :
          totalScore >= 60 ? 'C' :
          totalScore >= 50 ? 'D' :
          totalScore >= 1  ? 'E' : 'N/A'
        const remarks =
          totalScore >= 90 ? 'Highly Proficient' :
          totalScore >= 80 ? 'Proficient' :
          totalScore >= 70 ? 'Approaching' :
          totalScore >= 60 ? 'Developing' : 'Emerging'
        return {
          subject: subj,
          classScore,
          examScore,
          totalScore,
          position,
          grade,
          remarks
        }
      })
      const results = await Promise.all(promises)
      setSubjectRows(results.filter((r): r is NonNullable<typeof r> => !!r))
    }
    loadAllSubjectsForStudent()
  }, [subjects, student?.studentName, className, term])

  const handlePrint = () => {
    window.print()
  }
  const handleDownload = async () => {
    const report = document.getElementById('report-card')
    if (!report) return
    const canvas = await html2canvas(report, { scale: Math.min(3, (window.devicePixelRatio || 2)), useCORS: true, allowTaint: true, backgroundColor: '#ffffff', scrollY: -window.scrollY })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const imgWidthMm = pageWidth
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width
    let renderWidth = imgWidthMm
    let renderHeight = imgHeightMm
    let x = 0
    let y = 0
    if (imgHeightMm > pageHeight) {
      renderHeight = pageHeight
      renderWidth = (canvas.width * renderHeight) / canvas.height
      x = (pageWidth - renderWidth) / 2
      y = 0
    } else {
      x = 0
      y = (pageHeight - renderHeight) / 2
    }
    pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight)
    pdf.save(`report-card-${student?.studentName || studentId}.pdf`)
  }

  const nextTermFee = useMemo(() => {
    const g = (() => {
      const n = (className || '').toLowerCase().trim()
      if (n === 'creche') return 'Creche'
      if (n.startsWith('nursery')) return 'Nursery 1 & 2'
      if (n.startsWith('kg')) return 'KG 1 & 2'
      if (n.startsWith('bs')) {
        const m = n.match(/bs\s*(\d+)/)
        const num = m ? Number(m[1]) : 0
        if (num >= 1 && num <= 3) return 'BS 1 to 3'
        if (num >= 4 && num <= 6) return 'BS 4 to 6'
      }
      return ''
    })()
    // Use ONLY the server-provided SBA config for billing amounts
    const fees = sbaConfig?.feesByGroup || {}
    const val = g && fees[g] ? Number(fees[g]) : 0
    return Number.isFinite(val) ? val : 0
  }, [className, sba, sbaConfig])
  
  const arrearsAmount = useMemo(() => {
    const n = Number(student?.arrears || 0)
    return Number.isFinite(n) ? n : 0
  }, [student?.arrears])
  
  const totalDue = useMemo(() => {
    const sum = (nextTermFee || 0) + (arrearsAmount || 0)
    return Number.isFinite(sum) ? sum : 0
  }, [nextTermFee, arrearsAmount])

  return (
    <div className="flex flex-col items-center">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          body * { visibility: hidden; }
          #report-card, #report-card * { visibility: visible; }
          #report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            min-height: 297mm !important;
            max-width: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          #report-card .watermark {
            opacity: 0.06 !important;
            filter: grayscale(20%);
          }
        }
      `}</style>
      <div id="report-card" className="w-full max-w-[210mm] print:max-w-none bg-white p-8 relative min-h-[297mm] shadow-lg print:shadow-none print:p-0">
        
        {/* Watermark */}
        <div className="watermark absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
            <Image src="/cec_logo.png" alt="Watermark" width={900} height={900} />
        </div>

        <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-4">
                <div className="w-24 h-24 relative">
                    <Image src="/cec_logo.png" alt="Logo Left" fill className="object-contain" />
                </div>
                <div className="flex-1 text-center px-4">
                    <div className="text-[10px] font-bold tracking-widest uppercase mb-1">Ghana Education Service</div>
                    <h1 className="text-4xl font-black uppercase tracking-tight mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {schoolConfig?.schoolName || 'CHARIOT'}
                    </h1>
                     {/*  <h2 className="text-2xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        EDUCATIONAL COMPLEX
                    </h2> */}
                    <div className="text-[11px] font-bold leading-tight">
                        {schoolConfig?.address || 'P.O. BOX TA 435 Old - Tafo, Kumasi'}
                    </div>
                    <div className="text-[11px] font-bold leading-tight">
                        Duase - Near Life Chemist Pharmacy
                    </div>
                    <div className="text-[11px] font-bold leading-tight">
                        {schoolConfig?.momoNumber ? `0548525388, 0536282694, 0542715050` : '0548525388, 0536282694, 0542715050'}
                    </div>
                    <div className="mt-2">
                        <span className="text-lg font-bold border-b-2 border-black inline-block px-1">Terminal Report</span>
                    </div>
                </div>
                <div className="w-24 h-24 relative">
                    <Image src="/cec_logo.png" alt="Logo Right" fill className="object-contain" />
                </div>
            </div>

            {/* Student Details */}
            <div className="mb-4 text-[12px] font-bold font-serif w-full">
                {/* Row 1: Labels */}
                <div className="flex items-end mb-1">
                    <div className="w-[40%] italic">Name of Pupil</div>
                    <div className="w-[30%] text-center flex justify-center gap-2">
                        <span className="italic">Grade :</span>
                        <span className="font-bold border-b border-gray-400 min-w-[60px] text-center">{className}</span>
                    </div>
                    <div className="w-[30%] text-right flex justify-end gap-2 pr-4">
                        <span className="italic">Term :</span>
                        <span className="font-bold border-b border-gray-400 min-w-[80px] text-center">{term}</span>
                    </div>
                </div>

                {/* Row 2: Values */}
                <div className="flex items-start mb-2">
                    <div className="w-[40%] bg-blue-100/50 py-1 px-2 uppercase text-sm font-bold border-l-4 border-transparent">
                        {student?.studentName}
                    </div>
                    <div className="w-[30%] text-center flex justify-center gap-2 mt-1">
                        <span className="italic">No. on Roll:</span>
                        <span className="font-bold text-center">{typeof rollCount === 'number' ? rollCount : ''}</span>
                    </div>
                    <div className="w-[30%] text-right flex justify-end gap-2 mt-1 pr-4">
                        <span className="italic">Position:</span>
                        <span className="font-bold text-center">{sbaConfig?.position || assessment?.position || '4th'}</span>
                    </div>
                </div>

                {/* Row 3: Campus Location */}
                <div className="flex justify-end mb-3 pr-4">
                     <div className="flex gap-2 items-center">
                        <span className="italic">Campus Location :</span>
                        <span className="font-bold">{sbaConfig?.campus || 'Duase'}</span>
                    </div>
                </div>

                {/* Row 4: Dates */}
                <div className="flex justify-center items-center gap-8 text-[13px] border-t border-b border-dotted border-gray-400 py-1 mx-4">
                     <div className="flex gap-2 items-center">
                        <span className="font-bold">Closing Date :</span>
                        <span className="text-red-600 font-bold">{sbaConfig?.closingTerm || '17-Apr-25'}</span>
                    </div>
                     <div className="text-gray-300 text-xl">• • •</div>
                     <div className="flex gap-2 items-center">
                        <span className="font-bold">Next Term Begins :</span>
                        <span className="text-blue-700 font-bold">{sbaConfig?.nextTermBegins || '12-May-25'}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="mb-4">
                <table className="w-full text-[11px] border-collapse border border-gray-300 font-sans">
                    <thead>
                        <tr className="bg-gray-50 h-10">
                            <th className="border border-gray-300 px-2 text-left font-bold text-black w-[25%]">Subjects</th>
                            <th className="border border-gray-300 px-1 text-center font-bold">
                                <div>Class Score</div>
                                <div>50%</div>
                            </th>
                            <th className="border border-gray-300 px-1 text-center font-bold">
                                <div>Exam Score</div>
                                <div>50%</div>
                            </th>
                            <th className="border border-gray-300 px-1 text-center font-bold text-red-600">
                                <div>Total Score</div>
                                <div>100%</div>
                            </th>
                            <th className="border border-gray-300 px-1 text-center font-bold">
                                <div>Grade</div>
                                <div>Position</div>
                            </th>
                            <th className="border border-gray-300 px-2 text-center font-bold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectRows.map((row, idx) => (
                            <tr key={idx} className="h-7">
                                <td className="border border-gray-300 px-2 font-bold">{row.subject}</td>
                                <td className="border border-gray-300 px-1 text-center font-bold">{Math.round(row.classScore)}</td>
                                <td className="border border-gray-300 px-1 text-center font-bold">{Math.round(row.examScore)}</td>
                                <td className="border border-gray-300 px-1 text-center font-bold text-red-600">{Math.round(row.totalScore)}</td>
                                <td className="border border-gray-300 px-1 text-center font-bold">
                                  {row.grade}
                                </td>
                                <td className="border border-gray-300 px-2 text-center font-bold text-[10px]">{row.remarks}</td>
                            </tr>
                        ))}
                        {/* Empty rows if needed to fill space? */}
                    </tbody>
                </table>
            </div>

            {/* Grade Legend */}
            <div className="mb-3 text-[10px] font-sans">
              <div className="inline-block border border-gray-300 rounded px-2 py-1 bg-gray-50">
                <span className="font-bold mr-2">Grade Key:</span>
                <span className="mr-2">80% and above = A</span>
                <span className="mr-2">70–79% = B</span>
                <span className="mr-2">60–69% = C</span>
                <span className="mr-2">50–59% = D</span>
                <span className="mr-2">1–49% = E</span>
                <span className="">0 = N/A</span>
              </div>
            </div>

            {/* Attendance & Promotion */}
            <div className="flex justify-center gap-12 text-[12px] font-bold font-serif italic mb-4">
                 <div className="flex gap-2">
                    <span>Attendance :</span>
                    <span className="not-italic"></span>
                </div>
                 <div className="flex gap-2">
                    <span>Out of :</span>
                    <span className="not-italic">{sbaConfig?.totalAttendance || '65'}</span>
                </div>
                 <div className="flex gap-2">
                    <span>Promoted to :</span>
                    <span className="not-italic"></span>
                </div>
            </div>

            {/* Remarks Section */}
            <div className="space-y-1 mb-4">
                <div className="flex items-center">
                    <div className="w-[160px] bg-purple-700 text-white text-[11px] font-bold px-2 py-0.5 italic text-right pr-4">Conduct / Character :</div>
                    <div className="flex-1 px-2 text-[12px] italic border-b border-gray-200 bg-gray-50">:</div>
                </div>
                <div className="flex items-center">
                    <div className="w-[160px] bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 italic text-right pr-4">Attitude :</div>
                    <div className="flex-1 px-2 text-[12px] italic border-b border-gray-200 bg-gray-50">:</div>
                </div>
                <div className="flex items-center">
                    <div className="w-[160px] bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 italic text-right pr-4">Interest :</div>
                    <div className="flex-1 px-2 text-[12px] italic border-b border-gray-200 bg-gray-50">:</div>
                </div>
                <div className="flex items-center mt-2">
                    <div className="w-[160px] text-[11px] font-bold px-2 py-0.5 italic text-right pr-4 underline decoration-1">Class Teacher's Remarks :</div>
                    <div className="flex-1 px-2 text-[12px] italic border-b border-gray-200">:</div>
                </div>
                 <div className="flex items-center mt-1">
                    <div className="w-[180px] bg-green-500 text-white text-[11px] font-bold px-2 py-0.5 italic text-right pr-4">Head of School's Remarks :</div>
                    <div className="flex-1 px-2 text-[12px] italic border-b border-gray-200 text-[10px] leading-tight">:</div>
                </div>
            </div>

            {/* Signature & Billing */}
            <div className="flex mt-8">
                <div className="flex-1 pt-8 pl-8">
                    <div className="text-[12px] font-bold italic font-serif flex items-center gap-2">
                        <span>Signature :</span>
                        <div className="flex-1 relative">
                          <div className="border-b border-dotted border-gray-400"></div>
                          <div className="absolute left-8 -top-4">
                            <Image src="/signature.png" alt="Signature" width={160} height={40} />
                          </div>
                        </div>
                    </div>
                </div>
                <div className="w-[280px] border-2 border-black p-1">
                    <div className="text-center font-bold text-blue-700 text-[11px] underline mb-1">BILLING FOR THE TERM</div>
                    <div className="grid grid-cols-2 text-[11px] font-bold gap-y-1 px-1">
                        <div>Arrears</div>
                        <div className="pl-4">GH¢{arrearsAmount.toFixed(0)}</div>
                        
                        <div>Next Term Fee</div>
                        <div className="pl-4">GH¢{nextTermFee.toFixed(0)}</div>
                        
                        <div>Others</div>
                        <div className="pl-4">GH¢</div>
                        
                        <div className="text-red-600 mt-1">TOTAL AMT. DUE</div>
                        <div className="border-b-2 border-black font-black text-sm pl-4 mt-1">GH¢{totalDue.toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 bg-[#E6E6FA] py-1 text-center text-[10px] italic font-serif font-bold">
                Powered by Nasora Systems
            </div>
            
            <div className="mt-4">
                <span className="font-bold underline text-[12px] italic">Note:</span>
                <div className="text-center mt-1">
                    <span className="font-bold text-[13px]">Items to bring next term :</span>
                    <span className="text-blue-500 italic ml-2 text-[13px]">2 big Brooms</span>
                </div>
            </div>

        </div>
      </div>
      <div className="mt-4 print:hidden flex gap-2">
         <Button onClick={handlePrint}>Print Report</Button>
         <Button onClick={handleDownload}>Download PDF</Button>
      </div>
    </div>
  )
}
