'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface ClassAssessmentRecord {
  id: string;
  studentName: string;
  individualTestScore: number;
  classTestScore: number;
  totalClassScore: number;
  scaledClassScore: number;
  examScore: number;
  scaledExamScore: number;
  overallTotal: number;
  position: number;
}

interface SBAClassAssessmentProps {
  teacherName: string;
  subject: string;
  className: string;
  records: ClassAssessmentRecord[];
}

export function SBAClassAssessment({ teacherName, subject, className, records }: SBAClassAssessmentProps) {
  const router = useRouter();

  const handleViewReport = (recordId: string, studentName: string) => {
    const encodedId = encodeURIComponent(recordId);
    const encodedName = encodeURIComponent(studentName);

    router.push(
      `/students/${encodedId}/report?class=${encodeURIComponent(className)}&name=${encodedName}`
    );
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">SCHOOL BASED ASSESSMENT (S.B.A)</h1>
        <div className="text-lg">
          <p><strong>Teacher:</strong> {teacherName}</p>
          <p><strong>Subject:</strong> {subject}</p>
          <p><strong>Class:</strong> {className}</p>
        </div>
      </div>

      {/* Main Table */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="border border-gray-300 text-center font-semibold" rowSpan={2}>No.</TableHead>
                  <TableHead className="border border-gray-300 text-center font-semibold" rowSpan={2}>Student Name</TableHead>
                  <TableHead className="border border-gray-300 text-center" colSpan={2}>Class Score</TableHead>
                  <TableHead className="border border-gray-300 text-center font-semibold" rowSpan={2}>Total Class Score (60 marks)</TableHead>
                  <TableHead className="border border-gray-300 text-center font-semibold" rowSpan={2}>60 MKS SCALED TO (50%)</TableHead>
                  <TableHead className="border border-gray-300 text-center" colSpan={2}>End of Term Exam</TableHead>
                  <TableHead className="border border-gray-300 text-center font-semibold" rowSpan={2}>Overall Total</TableHead>
                  <TableHead className="border border-gray-300 text-center font-semibold" rowSpan={2}>Position</TableHead>
                  <TableHead className="border border-gray-300 text-center font-semibold" rowSpan={2}>Actions</TableHead>
                </TableRow>
                <TableRow className="bg-gray-100">
                  <TableHead className="border border-gray-300 text-center text-xs">Indv. Test (30mks)</TableHead>
                  <TableHead className="border border-gray-300 text-center text-xs">Class Test (30mks)</TableHead>
                  <TableHead className="border border-gray-300 text-center text-xs">100 MKS</TableHead>
                  <TableHead className="border border-gray-300 text-center text-xs">100 MKS SCALED TO (50%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="border border-gray-300 text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="border border-gray-300 font-medium">{record.studentName}</TableCell>
                    <TableCell className="border border-gray-300 text-center">{record.individualTestScore}</TableCell>
                    <TableCell className="border border-gray-300 text-center">{record.classTestScore}</TableCell>
                    <TableCell className="border border-gray-300 text-center font-semibold">{record.totalClassScore}</TableCell>
                    <TableCell className="border border-gray-300 text-center font-semibold">{record.scaledClassScore}</TableCell>
                    <TableCell className="border border-gray-300 text-center">{record.examScore}</TableCell>
                    <TableCell className="border border-gray-300 text-center font-semibold">{record.scaledExamScore}</TableCell>
                    <TableCell className="border border-gray-300 text-center font-bold">{record.overallTotal}</TableCell>
                    <TableCell className="border border-gray-300 text-center font-bold">
                      <Badge variant={record.position <= 3 ? 'default' : 'secondary'}>
                        {record.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewReport(record.id, record.studentName)}
                        className="flex items-center gap-1 mx-auto"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Report</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}