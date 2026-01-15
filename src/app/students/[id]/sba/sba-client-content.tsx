'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SBAConfig } from '@/lib/sba-config';

interface SBAClientContentProps {
  student: {
    id: string;
    studentName: string;
    class: string;
  };
  className: string;
  term: string;
  availableSubjects: string[];
  initialSubject: string;
  initialAssessmentData: any;
  onSubmitAssessment: (data: any) => Promise<void>;
  sbaConfig: SBAConfig;
}

export function SBAClientContent({ 
  student, 
  className, 
  term, 
  availableSubjects, 
  initialAssessmentData,
}: SBAClientContentProps) {
  const [assessmentData, setAssessmentData] = useState(initialAssessmentData);

  useEffect(() => {
    setAssessmentData(initialAssessmentData);
  }, [initialAssessmentData]);

  // Filter records for this specific student
  const studentRecords = assessmentData?.records?.filter((record: any) => 
    String(record.studentName || '').trim().toLowerCase() === String(student.studentName || '').trim().toLowerCase()
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SBA Assessment</h1>
          <p className="text-muted-foreground">{className} • {term}</p>
        </div>
        <Badge variant="outline" className="text-lg">{student.studentName}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student SBA Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2} className="w-[50px]">No.</TableHead>
                  <TableHead rowSpan={2} className="min-w-[150px]">Subject</TableHead>
                  <TableHead colSpan={2} className="text-center border-l">Class Score</TableHead>
                  <TableHead rowSpan={2} className="text-center border-l bg-muted/50">Total Class Score<br/>(60 marks)</TableHead>
                  <TableHead rowSpan={2} className="text-center border-l">60 MKS SCALED<br/>TO (50%)</TableHead>
                  <TableHead colSpan={2} className="text-center border-l border-r">End of Term Exam</TableHead>
                  <TableHead rowSpan={2} className="text-center">Overall Total</TableHead>
                  <TableHead rowSpan={2} className="text-center border-l">Position</TableHead>
                  <TableHead rowSpan={2} className="text-center border-l">Actions</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="text-center border-l text-xs">Indv. Test<br/>(30mks)</TableHead>
                  <TableHead className="text-center border-r text-xs">Class Test<br/>(30mks)</TableHead>
                  <TableHead className="text-center text-xs">100 MKS</TableHead>
                  <TableHead className="text-center border-l text-xs">100 MKS SCALED<br/>TO (50%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRecords.length > 0 ? (
                  studentRecords.map((record: any, index: number) => (
                    <TableRow key={record.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{record.subject}</TableCell>
                      
                      {/* Class Score Breakdown */}
                      <TableCell className="text-center border-l">{record.individualTestScore || record.individualTest || '-'}</TableCell>
                      <TableCell className="text-center border-r">{record.classTestScore || record.classTest || '-'}</TableCell>
                      
                      {/* Total Class Score (60) */}
                      <TableCell className="text-center bg-muted/50 font-bold">
                        {record.totalClassScore || '-'}
                      </TableCell>
                      
                      {/* Scaled Class Score (50%) */}
                      <TableCell className="text-center border-l">
                        {record.scaledClassScore || record.scaledTo30 || '-'}
                      </TableCell>
                      
                      {/* Exam Score (100) */}
                      <TableCell className="text-center border-l">
                        {record.examScore || record.endOfTermExam || '-'}
                      </TableCell>
                      
                      {/* Scaled Exam Score (50%) */}
                      <TableCell className="text-center border-l border-r">
                        {record.scaledExamScore || record.scaledTo70 || '-'}
                      </TableCell>
                      
                      {/* Overall Total */}
                      <TableCell className="text-center font-bold">
                        {record.overallTotal || '-'}
                      </TableCell>
                      
                      {/* Position */}
                      <TableCell className="text-center border-l">
                        {record.position || '-'}
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell className="text-center border-l">
                        <Button variant="ghost" size="sm">Report</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center h-24 text-muted-foreground">
                      No assessment records found for this student.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
