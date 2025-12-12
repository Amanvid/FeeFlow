import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents, getTeacherUsers, getNonTeacherUsers, getSchoolConfig } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const groups: string[] = Array.isArray(body.groups) ? body.groups : [];
    const classes: string[] = Array.isArray(body.classes) ? body.classes : [];
    const departments: string[] = Array.isArray(body.departments) ? body.departments : [];

    const config = await getSchoolConfig();

    const recipients: any[] = [];

    if (groups.includes('parents') || groups.includes('students')) {
      const students = await getAllStudents();
      students
        .filter(s => classes.length === 0 || classes.includes(s.class))
        .forEach(s => {
          recipients.push({
            id: `stu-${s.id}`,
            type: 'parent',
            name: s.guardianName || 'Parent',
            phone: s.guardianPhone,
            className: s.class,
            studentName: s.studentName,
            variables: {
              guardianName: s.guardianName || 'Parent',
              studentName: s.studentName,
              className: s.class,
              balance: s.balance,
              amount: s.amountPaid,
              dueDate: config.dueDate,
              schoolName: config.schoolName,
            }
          });
        });
    }

    if (groups.includes('teachers')) {
      const teachers = await getTeacherUsers();
      teachers
        .filter(t => classes.length === 0 || classes.includes(t.class))
        .forEach(t => {
          recipients.push({
            id: `t-${t.id}`,
            type: 'teacher',
            name: t.name || t.username,
            phone: t.phone || t.contact,
            className: t.class,
            variables: {
              teacherName: t.name,
              className: t.class,
              schoolName: config.schoolName,
            }
          });
        });
    }

    if (groups.includes('staff')) {
      const nonTeachers = await getNonTeacherUsers();
      nonTeachers
        .filter(nt => departments.length === 0 || departments.includes(nt.department))
        .forEach(nt => {
          recipients.push({
            id: `nt-${nt.id}`,
            type: 'staff',
            name: nt.name || nt.username,
            phone: nt.phone || nt.contact,
            department: nt.department,
            variables: {
              staffName: nt.name,
              department: nt.department,
              schoolName: config.schoolName,
            }
          });
        });
    }

    return NextResponse.json({ success: true, recipients });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to load recipients' }, { status: 500 });
  }
}
