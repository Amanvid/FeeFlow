'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface RecordRow {
  id: string
  studentName: string
  overallTotal: number | string
  position: number | string
  subjectCount?: number
}

export default function ClassRankingModal({
  className,
  subject,
  totalMax,
  records
}: {
  className: string
  subject: string
  totalMax: number
  records: RecordRow[]
}) {
  const sorted = useMemo(() => {
    const rows = (records || []).map(r => ({
      id: r.id,
      studentName: r.studentName,
      total: Number(r.overallTotal) || 0,
      position: String(r.position || '').trim(),
      subjectCount: typeof r.subjectCount === 'number' ? r.subjectCount : undefined
    }))
    const filtered = rows.filter(r => r.studentName && r.studentName.toLowerCase() !== 'student name')
    filtered.sort((a, b) => b.total - a.total)
    let lastScore = NaN
    let lastPosition = 0
    const ranked = filtered.map((r, i) => {
      const pos = r.total !== lastScore ? i + 1 : lastPosition
      lastScore = r.total
      lastPosition = pos
      return { ...r, computedPosition: pos }
    })
    return ranked
  }, [records])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">View Total Score Ranking</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{className} • {subject}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 text-sm">
          <div>Class Total Score: {totalMax}</div>
          <div>Top Score: {sorted.length ? Math.round(sorted[0].total) : 0}</div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right w-24">Subjects</TableHead>
                <TableHead className="w-24">Position</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{r.computedPosition}</TableCell>
                  <TableCell className="font-medium">{r.studentName}</TableCell>
                  <TableCell className="text-right">{Math.round(r.total)}</TableCell>
                  <TableCell className="text-right">{typeof r.subjectCount === 'number' ? r.subjectCount : ''}</TableCell>
                  <TableCell>{r.computedPosition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
