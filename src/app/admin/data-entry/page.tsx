"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { UserPlus, DollarSign, Book, Save, AlertCircle, CheckCircle } from "lucide-react";

interface StudentFormData {
  name: string;
  grade: string;
  studentType: 'New' | 'Old';
  gender: 'Male' | 'Female' | 'Other';
  guardianName: string;
  guardianPhone: string;
  totalBalance: number;
  arrears: number;
  booksFees: number;
  schoolFeesAmount: number;
  initialAmountPaid: number;
  payment: number;
  booksFeesPayment: number;
}

interface PaymentFormData {
  studentId: string;
  studentName: string;
  studentClass: string;
  paymentType: 'School Fees' | 'Books Fees';
  amount: number;
  paymentMethod: string;
}

interface PreviousPayments {
  initialAmountPaid: number;
  payment: number;
  booksFeesPayment: number;
}

interface Student {
  id: string;
  studentName: string;
  class: string;
  studentNumber: string;
}

export default function DataEntryPage() {
  const [activeTab, setActiveTab] = useState<'student' | 'payment'>('student');
  const [studentForm, setStudentForm] = useState<StudentFormData>({
    name: '',
    grade: '',
    studentType: 'New',
    gender: 'Male',
    guardianName: '',
    guardianPhone: '',
    totalBalance: 0,
    arrears: 0,
    booksFees: 0,
    schoolFeesAmount: 0,
    initialAmountPaid: 0,
    payment: 0,
    booksFeesPayment: 0,
  });
  
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    studentId: '',
    studentName: '',
    studentClass: '',
    paymentType: 'School Fees',
    amount: 0,
    paymentMethod: 'Cash',
  });
  
  const [previousPayments, setPreviousPayments] = useState<PreviousPayments>({
    initialAmountPaid: 0,
    payment: 0,
    booksFeesPayment: 0,
  });
  
  const [studentMessage, setStudentMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Fetch classes from the API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        const result = await response.json();
        
        if (result.success && result.classes) {
          setClasses(result.classes);
        } else {
          console.error('Failed to fetch classes:', result.message);
          // Fallback: provide some common classes if API fails
          setClasses(['KG 1', 'KG 2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3']);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        // Fallback: provide some common classes if API fails
        setClasses(['KG 1', 'KG 2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3']);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch students when class is selected
  const fetchStudentsByClass = async (selectedClass: string) => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    setIsLoadingStudents(true);
    try {
      const response = await fetch('/api/students');
      const result = await response.json();
      
      if (result.success && result.students) {
        // Filter students by the selected class
        const classStudents = result.students.filter((s: Student) => 
          s.class.toLowerCase() === selectedClass.toLowerCase()
        );
        setStudents(classStudents);
      } else {
        console.error('Failed to fetch students:', result.message);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Fetch student payment details
  const fetchStudentPaymentDetails = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      const result = await response.json();
      
      if (result.success && result.student) {
        setPreviousPayments({
          initialAmountPaid: result.student.schoolFeesPaid || 0,
          payment: result.student.amountPaid - (result.student.schoolFeesPaid || 0) - (result.student.booksFeePaid || 0),
          booksFeesPayment: result.student.booksFeePaid || 0
        });
      } else {
        console.error('Failed to fetch student payment details:', result.message);
        setPreviousPayments({
          initialAmountPaid: 0,
          payment: 0,
          booksFeesPayment: 0
        });
      }
    } catch (error) {
      console.error('Error fetching student payment details:', error);
      setPreviousPayments({
        initialAmountPaid: 0,
        payment: 0,
        booksFeesPayment: 0
      });
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStudentMessage(null);

    try {
      const response = await fetch('/api/add-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentForm),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStudentMessage({ type: 'success', message: 'Student added successfully!' });
        // Reset form
        setStudentForm({
          name: '',
          grade: '',
          studentType: 'New',
          gender: 'Male',
          guardianName: '',
          guardianPhone: '',
          totalBalance: 0,
          arrears: 0,
          booksFees: 0,
          schoolFeesAmount: 0,
          initialAmountPaid: 0,
          payment: 0,
          booksFeesPayment: 0,
        });
      } else {
        setStudentMessage({ type: 'error', message: result.message || 'Failed to add student' });
      }
    } catch (error) {
      setStudentMessage({ type: 'error', message: 'Network error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPaymentMessage(null);

    try {
      const response = await fetch('/api/record-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentForm),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentMessage({ type: 'success', message: 'Payment recorded successfully!' });
        // Reset form
        setPaymentForm({
          studentId: '',
          studentName: '',
          studentClass: '',
          paymentType: 'School Fees',
          amount: 0,
          paymentMethod: 'Cash',
        });
        setStudents([]); // Clear students list
      } else {
        setPaymentMessage({ type: 'error', message: result.message || 'Failed to record payment' });
      }
    } catch (error) {
      setPaymentMessage({ type: 'error', message: 'Network error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'student' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('student')}
          className="flex-1"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
        <Button
          variant={activeTab === 'payment' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('payment')}
          className="flex-1"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {activeTab === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Add New Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {studentMessage && (
                <Alert variant={studentMessage.type === 'success' ? 'default' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{studentMessage.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Student Name *</Label>
                  <Input
                    id="name"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    required
                    placeholder="Enter student full name"
                  />
                </div>

                <div>
                  <Label htmlFor="grade">Class/Grade *</Label>
                  <Select
                    value={studentForm.grade}
                    onValueChange={(value) => setStudentForm({ ...studentForm, grade: value })}
                    required
                  >
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="Select a class/grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingClasses ? (
                        <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                      ) : classes.length > 0 ? (
                        classes.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="studentType">Student Type</Label>
                  <Select
                    value={studentForm.studentType}
                    onValueChange={(value: 'New' | 'Old') => setStudentForm({ ...studentForm, studentType: value })}
                  >
                    <SelectTrigger id="studentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New Student</SelectItem>
                      <SelectItem value="Old">Old Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={studentForm.gender}
                    onValueChange={(value: 'Male' | 'Female' | 'Other') => setStudentForm({ ...studentForm, gender: value })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="guardianName">Guardian Name *</Label>
                  <Input
                    id="guardianName"
                    value={studentForm.guardianName}
                    onChange={(e) => setStudentForm({ ...studentForm, guardianName: e.target.value })}
                    required
                    placeholder="Enter guardian full name"
                  />
                </div>

                <div>
                  <Label htmlFor="guardianPhone">Guardian Phone *</Label>
                  <Input
                    id="guardianPhone"
                    value={studentForm.guardianPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, guardianPhone: e.target.value })}
                    required
                    placeholder="e.g., 233xxxxxxxxx"
                  />
                </div>

                <div>
                  <Label htmlFor="booksFees">Books Fees (GH₵)</Label>
                  <Input
                    id="booksFees"
                    type="number"
                    step="0.01"
                    value={studentForm.booksFees}
                    onChange={(e) => setStudentForm({ ...studentForm, booksFees: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="schoolFeesAmount">School Fees (GH₵)</Label>
                  <Input
                    id="schoolFeesAmount"
                    type="number"
                    step="0.01"
                    value={studentForm.schoolFeesAmount}
                    onChange={(e) => setStudentForm({ ...studentForm, schoolFeesAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="arrears">Arrears (GH₵)</Label>
                  <Input
                    id="arrears"
                    type="number"
                    step="0.01"
                    value={studentForm.arrears}
                    onChange={(e) => setStudentForm({ ...studentForm, arrears: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="initialAmountPaid">Initial Amount Paid (GH₵)</Label>
                  <Input
                    id="initialAmountPaid"
                    type="number"
                    step="0.01"
                    value={studentForm.initialAmountPaid}
                    onChange={(e) => setStudentForm({ ...studentForm, initialAmountPaid: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="payment">Additional Payment (GH₵)</Label>
                  <Input
                    id="payment"
                    type="number"
                    step="0.01"
                    value={studentForm.payment}
                    onChange={(e) => setStudentForm({ ...studentForm, payment: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="booksFeesPayment">Books Payment (GH₵)</Label>
                  <Input
                    id="booksFeesPayment"
                    type="number"
                    step="0.01"
                    value={studentForm.booksFeesPayment}
                    onChange={(e) => setStudentForm({ ...studentForm, booksFeesPayment: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Adding Student...' : 'Add Student'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Record Student Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {paymentMessage && (
                <Alert variant={paymentMessage.type === 'success' ? 'default' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{paymentMessage.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentClass">Student Class *</Label>
                  <Select
                    value={paymentForm.studentClass}
                    onValueChange={(value) => {
                      setPaymentForm({ 
                        ...paymentForm, 
                        studentClass: value,
                        studentId: '',
                        studentName: ''
                      });
                      fetchStudentsByClass(value);
                    }}
                    required
                  >
                    <SelectTrigger id="studentClass">
                      <SelectValue placeholder="Select a class/grade first" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingClasses ? (
                        <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                      ) : classes.length > 0 ? (
                        classes.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Select
                    value={paymentForm.studentId}
                    onValueChange={(value) => {
                      const selectedStudent = students.find(s => s.id === value);
                      if (selectedStudent) {
                        setPaymentForm({ 
                          ...paymentForm, 
                          studentId: value,
                          studentName: selectedStudent.studentName
                        });
                        // Fetch payment details for the selected student
                        fetchStudentPaymentDetails(value);
                      }
                    }}
                    required
                    disabled={!paymentForm.studentClass || isLoadingStudents}
                  >
                    <SelectTrigger id="studentName">
                      <SelectValue placeholder={paymentForm.studentClass ? "Select a student" : "First select a class"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStudents ? (
                        <SelectItem value="loading" disabled>Loading students...</SelectItem>
                      ) : students.length > 0 ? (
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.studentName}
                          </SelectItem>
                        ))
                      ) : paymentForm.studentClass ? (
                        <SelectItem value="no-students" disabled>No students found in this class</SelectItem>
                      ) : (
                        <SelectItem value="select-class" disabled>First select a class</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Previous Payment Display */}
              {paymentForm.studentId && (
                <div className="space-y-2">
                  <Label>Previous Payments</Label>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-md">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Initial Amount</div>
                      <div className="text-lg font-semibold text-green-600">GH₵{previousPayments.initialAmountPaid.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Additional Payments</div>
                      <div className="text-lg font-semibold text-blue-600">GH₵{previousPayments.payment.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Books Fees</div>
                      <div className="text-lg font-semibold text-purple-600">GH₵{previousPayments.booksFeesPayment.toFixed(2)}</div>
                    </div>
                  </div>
                  {/* Payment Target Message */}
                  <div className="p-2 bg-blue-50 rounded-md text-sm">
                    {paymentForm.paymentType === 'School Fees' ? (
                      previousPayments.initialAmountPaid === 0 ? (
                        <span className="text-blue-700">This payment will be recorded as <strong>Initial Amount Paid</strong></span>
                      ) : (
                        <span className="text-blue-700">This payment will be recorded as <strong>Additional Payment</strong></span>
                      )
                    ) : (
                      <span className="text-purple-700">This payment will be recorded as <strong>Books Fees Payment</strong></span>
                    )}
                  </div>
                </div>
              )}

                <div>
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select
                  value={paymentForm.paymentType}
                  onValueChange={(value: 'School Fees' | 'Books Fees') => {
                    setPaymentForm({ ...paymentForm, paymentType: value });
                    // Payment target message will automatically update due to re-render
                  }}
                >
                    <SelectTrigger id="paymentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="School Fees">School Fees</SelectItem>
                      <SelectItem value="Books Fees">Books Fees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount (GH₵) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={paymentForm.paymentMethod}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Recording Payment...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}