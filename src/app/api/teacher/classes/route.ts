import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { getAllStudents } from '@/lib/data';

export async function GET() {
  try {
    const session = await verifySession();
    
    if (!session || session.userType !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all students to extract unique classes
    const students = await getAllStudents();
    
    // Extract unique classes
    const classesSet = new Set<string>();
    students.forEach(student => {
      if (student.class) {
        classesSet.add(student.class);
      }
    });

    const classes = Array.from(classesSet).sort();

    return NextResponse.json({ 
      success: true,
      classes: classes.map(className => ({
        name: className,
        studentCount: students.filter(s => s.class === className).length
      }))
    });
  } catch (error) {
    console.error('Teacher classes API error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}