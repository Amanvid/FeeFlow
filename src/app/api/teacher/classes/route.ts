import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { getAllStudents, getTeacherUsers } from '@/lib/data'

export async function GET() {
  try {
    const session = await verifySession()

    console.log('Teacher classes API - Session:', session)

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

    // Check if teacher has admin privileges - if yes, show all classes
    // First check session, then verify with teacher data from Google Sheets
    const username = session.username

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teachers = await getTeacherUsers()
    const teacher = teachers.find(t => t.username === username && t.status === 'active')

    console.log('Teacher classes API - Teachers found:', teachers.length)
    console.log('Teacher classes API - Current teacher:', teacher)
    console.log('Teacher classes API - Session adminPrivileges:', session.adminPrivileges)
    console.log('Teacher classes API - Teacher adminPrivileges:', teacher?.adminPrivileges)

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin privileges from both session and teacher data
    const sessionAdminPrivileges = session.adminPrivileges === 'Yes'
    const teacherAdminPrivileges = teacher.adminPrivileges === 'Yes'
    const hasAdminPrivileges = sessionAdminPrivileges || teacherAdminPrivileges

    console.log('Teacher classes API - Has admin privileges:', hasAdminPrivileges)
    
    if (hasAdminPrivileges) {
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
