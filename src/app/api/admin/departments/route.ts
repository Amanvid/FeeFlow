import { NextResponse } from 'next/server';
import { getNonTeacherUsers } from '@/lib/data';

export async function GET() {
  try {
    const nonTeachers = await getNonTeacherUsers();
    const departmentsSet = new Set<string>();
    nonTeachers.forEach(nt => {
      const d = (nt.department || '').trim();
      if (d) departmentsSet.add(d);
    });
    const departments = Array.from(departmentsSet).sort();
    return NextResponse.json({ success: true, departments });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to load departments' }, { status: 500 });
  }
}
