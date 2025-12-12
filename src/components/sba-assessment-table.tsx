import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SBAAssessmentRecord {
  id: string;
  studentName: string;
  individualTest: number;
  classTest: number;
  totalClassScore: number;
  scaledTo30: number;
  endOfTermExam: number;
  scaledTo70: number;
  overallTotal: number;
  position: number;
}

interface SBAAssessmentTableProps {
  teacherName: string;
  subject: string;
  className: string;
  records: SBAAssessmentRecord[];
}

export function SBAAssessmentTable({ teacherName, subject, className, records }: SBAAssessmentTableProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="text-center space-y-2">
          <CardTitle className="text-xl font-bold">SCHOOL BASED ASSESSMENT (S.B.A)</CardTitle>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-left">
              <span className="font-medium">Name of Teacher:</span>
              <span className="ml-2">{teacherName}</span>
            </div>
            <div className="text-center">
              <span className="font-medium">Subject:</span>
              <span className="ml-2 font-semibold">{subject}</span>
            </div>
            <div className="text-right">
              <span className="font-medium">Class:</span>
              <span className="ml-2 font-semibold">{className}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-t border-b">
                <TableHead className="text-center border-r w-12">No.</TableHead>
                <TableHead className="text-left border-r min-w-[200px]">Name of Pupil / Student</TableHead>
                <TableHead className="text-center border-r" colSpan={2}>Class Assessment</TableHead>
                <TableHead className="text-center border-r">Total Class Score</TableHead>
                <TableHead className="text-center border-r">30 MKS<br/>SCALED TO</TableHead>
                <TableHead className="text-center border-r">End of Term<br/>Exam</TableHead>
                <TableHead className="text-center border-r">100 MKS<br/>SCALED TO</TableHead>
                <TableHead className="text-center border-r">Overall<br/>Total</TableHead>
                <TableHead className="text-center">Position</TableHead>
              </TableRow>
              <TableRow className="border-b">
                <TableHead className="text-center border-r"></TableHead>
                <TableHead className="text-left border-r"></TableHead>
                <TableHead className="text-center border-r w-16">Indv.<br/>Test<br/>10mks</TableHead>
                <TableHead className="text-center border-r w-16">Class<br/>Test<br/>20mks</TableHead>
                <TableHead className="text-center border-r">30 marks</TableHead>
                <TableHead className="text-center border-r">30%</TableHead>
                <TableHead className="text-center border-r">100 marks</TableHead>
                <TableHead className="text-center border-r">70%</TableHead>
                <TableHead className="text-center border-r"></TableHead>
                <TableHead className="text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, index) => (
                <TableRow key={record.id} className="border-b">
                  <TableCell className="text-center border-r font-medium">{index + 1}</TableCell>
                  <TableCell className="border-r font-medium">{record.studentName}</TableCell>
                  <TableCell className="text-center border-r">{record.individualTest.toFixed(2)}</TableCell>
                  <TableCell className="text-center border-r">{record.classTest.toFixed(2)}</TableCell>
                  <TableCell className="text-center border-r font-semibold">{record.totalClassScore.toFixed(2)}</TableCell>
                  <TableCell className="text-center border-r font-semibold">{record.scaledTo30.toFixed(2)}</TableCell>
                  <TableCell className="text-center border-r">{record.endOfTermExam.toFixed(2)}</TableCell>
                  <TableCell className="text-center border-r font-semibold">{record.scaledTo70.toFixed(2)}</TableCell>
                  <TableCell className="text-center border-r font-bold text-lg">{record.overallTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-center font-bold">{record.position}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}