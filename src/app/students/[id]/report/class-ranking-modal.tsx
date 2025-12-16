'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
    rows.sort((a, b) => b.total - a.total)
    return rows
  }, [records])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">View Total Score Ranking</Button>
      </DialogTrigger>
      <DialogContent>
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
                <TableHead className="w-24 text-right">Subjects</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{r.studentName}</TableCell>
                  <TableCell className="text-right">{Math.round(r.total)}</TableCell>
                  <TableCell className="text-right">{typeof r.subjectCount === 'number' ? r.subjectCount : ''}</TableCell>
                  <TableCell>{r.position || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
