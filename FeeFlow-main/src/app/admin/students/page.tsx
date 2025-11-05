
import { getAllStudents } from "@/lib/data";
import StudentsTable from "@/components/admin/students-table";

export default async function AdminStudentsPage() {
  const students = await getAllStudents();

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <StudentsTable students={students} />
    </div>
  );
}
