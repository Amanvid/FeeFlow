import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { getAllStudents, getTeacherUsers } from '@/lib/data'

export async function GET() {
  try {
    const session = await verifySession()

    if (!session || (session.userType !== 'teacher' && session.userType !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const students = await getAllStudents()

    if (session.userType === 'admin') {
      const classesSet = new Set<string>()
      students.forEach(student => {
        if (student.class) {
          classesSet.add(student.class)
        }
      })

      const classes = Array.from(classesSet).sort()

      return NextResponse.json({
        success: true,
        classes: classes.map(className => ({
          name: className,
          studentCount: students.filter(s => s.class === className).length
        }))
      })
    }

    const username = session.username

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teachers = await getTeacherUsers()
    const teacher = teachers.find(t => t.username === username && t.status === 'active')

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teacherClasses = (teacher.class || '')
      .split(',')
      .map(c => c.trim().toLowerCase())
      .filter(c => c.length > 0)

    const teacherClassSet = new Set(teacherClasses)

    const classesSet = new Set<string>()
    students.forEach(student => {
      const studentClass = (student.class || '').trim()
      if (!studentClass) return

      const normalized = studentClass.toLowerCase()
      if (teacherClassSet.has(normalized)) {
        classesSet.add(studentClass)
      }
    })

    const classes = Array.from(classesSet).sort()

    return NextResponse.json({
      success: true,
      classes: classes.map(className => ({
        name: className,
        studentCount: students.filter(s => s.class === className).length
      }))
    })
  } catch (error) {
    console.error('Teacher classes API error:', error)
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    )
  }
}
