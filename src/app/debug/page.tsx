import { getSchoolConfig, getAllStudents } from "@/lib/data";
import { SchoolConfig, Student } from "@/lib/definitions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DebugPage() {
  const config = await getSchoolConfig();
  const students = await getAllStudents();

  // Get all unique keys from all student objects
  const studentKeys = students.reduce((acc: string[], student: Record<string, any>) => {
    Object.keys(student).forEach(key => {
      if (!acc.includes(key)) {
        acc.push(key);
      }
    });
    return acc;
  }, []);


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Debug Page: Google Sheet API Response</h1>
      
      <h2 className="text-xl font-bold mt-8 mb-2">School Config</h2>
      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
        {JSON.stringify(config, null, 2)}
      </pre>

      <h2 className="text-xl font-bold mt-8 mb-2">Students Data ({students.length} records)</h2>
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {studentKeys.map(key => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.slice(0, 10).map((student, index) => ( // Display first 10 students for brevity
                <TableRow key={student.id || index}>
                  {studentKeys.map(key => (
                    <TableCell key={key}>
                      {String(student[key as keyof Student] === undefined || student[key as keyof Student] === null ? '' : student[key as keyof Student])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
       <h3 className="text-lg font-bold mt-4">Full Student Data (JSON)</h3>
       <pre className="bg-gray-100 p-4 rounded-md max-h-96 overflow-auto">
        {JSON.stringify(students.slice(0, 10), null, 2)}
      </pre>
    </div>
  );
}
