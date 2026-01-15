'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { NotificationBanner } from '@/components/ui/notification-banner';

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
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/teacher/students/${encodeURIComponent(className)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 403) {
          setError(result.message || 'Access Denied: You do not have permission to view this class.');
        } else if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
          router.push('/teacher/login');
        } else {
          setError(result.message || 'Failed to fetch students');
        }
        setStudents([]);
        return;
      }

      setStudents(result.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
      setStudents([]);
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
    if (balance <= 0) return 'bg-green-50 text-green-700 border-green-200';
    if (balance > 0 && balance <= 100) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getCardGradient = (balance: number) => {
    if (balance <= 0) return 'bg-gradient-to-br from-green-25 to-green-50';
    if (balance > 0 && balance <= 100) return 'bg-gradient-to-br from-yellow-25 to-yellow-50';
    return 'bg-gradient-to-br from-red-25 to-red-50';
  };

  const getCardBorder = (balance: number) => {
    if (balance <= 0) return 'border-green-200 hover:border-green-300';
    if (balance > 0 && balance <= 100) return 'border-yellow-200 hover:border-yellow-300';
    return 'border-red-200 hover:border-red-300';
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
          <div className="mb-6">
            <NotificationBanner
              variant={error.startsWith('Access Denied') ? 'warning' : 'error'}
              title={error.startsWith('Access Denied') ? 'Access Denied' : 'Error'}
              message={error}
            />
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
              <div key={student.id} className={`${getCardGradient(student.balance)} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border ${getCardBorder(student.balance)}`}>
                {/* Student Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-600">{student.class}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.balance)}`}>
                    {student.balance <= 0 ? 'Paid' : 'Balance Due'}
                  </span>
                </div>

                {/* Fee Breakdown */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Fee Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center bg-white/30 rounded px-3 py-2">
                      <span className="text-gray-600">Last Term Arrears:</span>
                      <span className="font-medium text-gray-700">{formatCurrency(student.feeBreakdown.lastTermArrears)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/30 rounded px-3 py-2">
                      <span className="text-gray-600">Current Term Fees:</span>
                      <span className="font-medium text-gray-700">{formatCurrency(student.feeBreakdown.currentTermFees)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/30 rounded px-3 py-2">
                      <span className="text-gray-600">Books:</span>
                      <span className="font-medium text-gray-700">{formatCurrency(student.feeBreakdown.books)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2" />
                    <div className="flex justify-between items-center bg-white/50 rounded px-3 py-2 font-semibold">
                      <span className="text-gray-800">Total Fees:</span>
                      <span className="text-gray-800">{formatCurrency(student.totalFees)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Amount Paid</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center bg-green-25/50 rounded px-3 py-2">
                      <span className="text-gray-600">Fees:</span>
                      <span className="font-medium text-green-700">{formatCurrency(student.paymentBreakdown.feesPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-25/50 rounded px-3 py-2">
                      <span className="text-gray-600">Books:</span>
                      <span className="font-medium text-green-700">{formatCurrency(student.paymentBreakdown.booksPaid)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2" />
                    <div className="flex justify-between items-center bg-green-50/50 rounded px-3 py-2 font-semibold">
                      <span className="text-gray-800">Total Paid:</span>
                      <span className="text-green-700">{formatCurrency(student.amountPaid)}</span>
                    </div>
                  </div>
                </div>

                {/* Balance and Due Date */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center bg-white/30 rounded-lg px-4 py-3 border-2 border-gray-200">
                    <span className="text-lg font-bold text-gray-800">Balance:</span>
                    <span className={`text-2xl font-bold ${student.balance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(student.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-yellow-50 rounded-lg px-4 py-3 border-2 border-yellow-200">
                    <span className="text-sm font-bold text-yellow-800">Due Date:</span>
                    <span className="text-sm font-bold text-yellow-700">{student.dueDate}</span>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Parent/Guardian Info</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center bg-gray-25/30 rounded px-3 py-2">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-700">{student.parentName}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-25/30 rounded px-3 py-2">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-bold text-gray-700">{student.parentPhone}</span>
                    </div>
                    {student.parentEmail && (
                      <div className="flex justify-between items-center bg-gray-25/30 rounded px-3 py-2">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-700">{student.parentEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center bg-gray-25/30 rounded px-3 py-2">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-700">{student.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/students/${encodeURIComponent(student.id)}/sba?class=${encodeURIComponent(student.class)}`}
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View SBA
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
