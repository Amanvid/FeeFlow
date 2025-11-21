'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  class: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  location: string;
  payments: any[];
  feeBreakdown: {
    lastTermArrears: number;
    currentTermFees: number;
    books: number;
  };
  paymentBreakdown: {
    feesPaid: number;
    booksPaid: number;
  };
  totalFees: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  status: string;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.className) {
      const decodedClassName = decodeURIComponent(params.className as string);
      setClassName(decodedClassName);
      fetchStudents(decodedClassName);
      fetchTeacherInfo();
    }
  }, [params.className]);

  const fetchTeacherInfo = async () => {
    try {
      const response = await fetch('/api/auth/teacher-session');
      const result = await response.json();
      
      if (result.success) {
        setTeacherName(result.teacher.name);
      } else {
        router.push('/teacher/login');
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
      router.push('/teacher/login');
    }
  };

  const fetchStudents = async (className: string) => {
    try {
      const response = await fetch(`/api/teacher/students/${encodeURIComponent(className)}`);
      const result = await response.json();
      
      if (result.success) {
        setStudents(result.students);
      } else {
        setError('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/teacher-logout', { method: 'POST' });
      router.push('/teacher/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const getStatusColor = (balance: number) => {
    if (balance <= 0) return 'bg-green-100 text-green-800';
    if (balance > 0 && balance <= 100) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Portal</h1>
              <p className="text-sm text-gray-600">Welcome, {teacherName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/teacher/classes"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Classes
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{className} - Students</h2>
          <p className="text-gray-600">
            {students.length} {students.length === 1 ? 'student' : 'students'} found
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No students found</p>
              <p className="text-sm">There are no students in this class.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                {/* Student Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-600">{student.class}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.balance)}`}>
                    {student.balance <= 0 ? 'Paid' : 'Balance Due'}
                  </span>
                </div>

                {/* Fee Breakdown */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Fee Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Term Arrears:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(student.feeBreakdown.lastTermArrears)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Term Fees:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(student.feeBreakdown.currentTermFees)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Books:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(student.feeBreakdown.books)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-gray-900">Total Fees:</span>
                      <span className="text-gray-900">{formatCurrency(student.totalFees)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Amount Paid</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">- Fees:</span>
                      <span className="font-medium text-green-600">{formatCurrency(student.paymentBreakdown.feesPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">- Books:</span>
                      <span className="font-medium text-green-600">{formatCurrency(student.paymentBreakdown.booksPaid)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-gray-900">Total Paid:</span>
                      <span className="text-green-600">{formatCurrency(student.amountPaid)}</span>
                    </div>
                  </div>
                </div>

                {/* Balance & Due Date */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Balance:</span>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(student.balance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <span className="text-sm font-medium text-gray-900">{student.dueDate}</span>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="border-t pt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Parent/Guardian Info</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Name:</strong> {student.parentName}</p>
                    <p><strong>Phone:</strong> {student.parentPhone}</p>
                    {student.parentEmail && (
                      <p><strong>Email:</strong> {student.parentEmail}</p>
                    )}
                    <p><strong>Location:</strong> {student.location}</p>
                  </div>
                </div>

                {/* Books Information - REMOVED to avoid duplication with Fee Breakdown */}

                {/* Payment History */}
                {student.payments && student.payments.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Payments</h4>
                    <div className="space-y-1">
                      {student.payments.slice(-3).map((payment: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{payment.date || 'Unknown date'}</span>
                          <span className="text-green-600 font-medium">{formatCurrency(payment.amount || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}