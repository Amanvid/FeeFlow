import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { getAllStudents, getSchoolConfig, getTeacherUsers } from '@/lib/data'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ className: string }> }
) {
  try {
    const session = await verifySession()

    if (!session || (session.userType !== 'teacher' && session.userType !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { className } = await params

    if (!className) {
      return NextResponse.json(
        { success: false, message: 'Class name is required' },
        { status: 400 }
      )
    }

    const decodedClassName = decodeURIComponent(className)

    if (session.userType === 'teacher') {
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

      // Check if teacher has admin privileges - if yes, skip class assignment check
      const hasAdminPrivileges = session.adminPrivileges === 'Yes' || teacher.adminPrivileges === 'Yes'
      
      if (!hasAdminPrivileges) {
        const requestedClass = decodedClassName.trim().toLowerCase()
        const teacherClasses = (teacher.class || '')
          .split(',')
          .map(c => c.trim().toLowerCase())
          .filter(c => c.length > 0)

        const hasAccess = teacherClasses.includes(requestedClass)

        if (!hasAccess) {
          return NextResponse.json(
            {
              success: false,
              message: 'Access Denied: You do not have permission to view this class.'
            },
            { status: 403 }
          )
        }
      }
    }

    const schoolConfig = await getSchoolConfig()

    const students = await getAllStudents()
    const classStudents = students.filter(student =>
      student.class === decodedClassName
    )

    const transformedStudents = classStudents.map(student => ({
      id: student.id,
      name: student.studentName,
      class: student.class,
      parentName: student.guardianName,
      parentPhone: student.guardianPhone,
      parentEmail: '',
      location: 'Not specified',
      payments: [],
      feeBreakdown: {
        lastTermArrears: student.arrears,
        currentTermFees: student.fees,
        books: student.books
      },
      paymentBreakdown: {
        feesPaid: student.schoolFeesPaid,
        booksPaid: student.booksFeePaid
      },
      totalFees: student.fees + student.books + student.arrears,
      amountPaid: student.schoolFeesPaid + student.booksFeePaid,
      balance: student.balance,
      dueDate: schoolConfig.dueDate,
      status: student.balance <= 0 ? 'Paid' : 'Balance Due'
    }))

    return NextResponse.json({
      success: true,
      students: transformedStudents,
      className: decodedClassName,
      totalStudents: transformedStudents.length
    })
  } catch (error) {
    console.error('Teacher students API error:', error)
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    )
  }
}
