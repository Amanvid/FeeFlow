'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SubjectSelector } from '@/components/subject-selector';
import { ArrowLeft, BookOpen, User, Plus, X } from 'lucide-react';
import { getStudentsByClass } from '@/lib/data';
import type { Student as StudentType } from '@/lib/definitions';

interface Student {
  id: string;
  studentName: string;
  individualTestScore: string;
  classTestScore: string;
  totalClassScore: string;
  scaledClassScore: string;
  examScore: string;
  scaledExamScore: string;
  overallTotal: string;
  position: string;
}

interface SBAAssessmentData {
  subject: string;
  term: string;
  className: string;
  records: Student[];
}

export default function ClassSBAAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const className = params.className ? decodeURIComponent(params.className as string) : '';
  
  const [assessmentData, setAssessmentData] = useState<SBAAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    individualTestScore: '',
    classTestScore: '',
    examScore: ''
  });
  const [students, setStudents] = useState<StudentType[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);

  const terms = ['1', '2', '3'];
  const termLabels = ['1st Term', '2nd Term', '3rd Term'];

  useEffect(() => {
    if (!className) return;
    const loadSubjects = async () => {
      try {
        const resp = await fetch(`/api/sba/class-subjects?className=${encodeURIComponent(className)}`);
        if (resp.ok) {
          const data = await resp.json();
          const list: string[] = Array.isArray(data.subjects) ? data.subjects : [];
          let finalList = list;
          if (finalList.length === 0) {
            finalList = className === 'Creche'
              ? ['Literacy', 'Numeracy', 'Colouring', 'Scribbling']
              : ['English', 'Mathematics', 'Science', 'Computing', 'History', 'R.M.E', 'Asante - Twi', 'Creative Arts'];
          }
          setSubjects(finalList);
          if (!selectedSubject || !finalList.includes(selectedSubject)) {
            setSelectedSubject(finalList[0] || '');
          }
        } else {
          const fallback = className === 'Creche'
            ? ['Literacy', 'Numeracy', 'Colouring', 'Scribbling']
            : ['English', 'Mathematics', 'Science', 'Computing', 'History', 'R.M.E', 'Asante - Twi', 'Creative Arts'];
          setSubjects(fallback);
          setSelectedSubject(fallback[0] || '');
        }
      } catch (e) {
        const fallback = className === 'Creche'
          ? ['Literacy', 'Numeracy', 'Colouring', 'Scribbling']
          : ['English', 'Mathematics', 'Science', 'Computing', 'History', 'R.M.E', 'Asante - Twi', 'Creative Arts'];
        setSubjects(fallback);
        setSelectedSubject(fallback[0] || '');
      }
    };
    loadSubjects();
  }, [className]);

  // Calculate derived fields
  const calculateDerivedFields = (individualTest: string, classTest: string, examScore: string) => {
    const individual = parseFloat(individualTest) || 0;
    const classTestScore = parseFloat(classTest) || 0;
    const exam = parseFloat(examScore) || 0;
    
    const totalClassScore = individual + classTestScore;
    const scaledClassScore = Math.round((totalClassScore / 60) * 50);
    const scaledExamScore = Math.round((exam / 100) * 50);
    const overallTotal = scaledClassScore + scaledExamScore;
    
    return {
      totalClassScore: totalClassScore.toString(),
      scaledClassScore: scaledClassScore.toString(),
      scaledExamScore: scaledExamScore.toString(),
      overallTotal: overallTotal.toString()
    };
  };

  const updatePositionsInSheet = async () => {
    try {
      const response = await fetch('/api/sba/update-positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          className,
          subject: selectedSubject,
          term: selectedTerm
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update positions');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the data to show updated positions
        await fetchSBAData();
        alert(`Positions updated successfully for ${result.updatedCount} students`);
      } else {
        throw new Error(result.message || 'Failed to update positions');
      }
    } catch (error) {
      console.error('Error updating positions:', error);
      alert('Failed to update positions. Please try again.');
    }
  };

  // Calculate position based on overall total (maintain original order, only update positions)
  const calculatePosition = (students: Student[]) => {
    // Create a copy with current overall totals for ranking
    const studentsWithTotals = students.map(student => ({
      ...student,
      numericTotal: parseFloat(student.overallTotal) || 0
    }));

    // Sort by total to determine rankings (but don't change original order)
    const sortedByTotal = [...studentsWithTotals].sort((a, b) => b.numericTotal - a.numericTotal);
    
    // Create a position map based on totals
    const positionMap = new Map<number, number>();
    sortedByTotal.forEach((student, index) => {
      positionMap.set(student.numericTotal, index + 1);
    });

    // Return students in original order with updated positions
    return students.map(student => ({
      ...student,
      position: positionMap.get(parseFloat(student.overallTotal) || 0)?.toString() || '0'
    }));
  };

  const handleEditStudent = (student: Student) => {
    setFormData({
      studentName: student.studentName,
      individualTestScore: student.individualTestScore,
      classTestScore: student.classTestScore,
      examScore: student.examScore
    });
    setEditingStudentId(student.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewReport = (studentId: string, studentName: string) => {
    const encodedId = encodeURIComponent(studentId);
    const encodedName = encodeURIComponent(studentName);
    router.push(`/students/${encodedId}/report?class=${encodeURIComponent(className)}&name=${encodedName}`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const derivedFields = calculateDerivedFields(
        formData.individualTestScore,
        formData.classTestScore,
        formData.examScore
      );

      if (isEditing && editingStudentId) {
        // Editing existing student - save to Google Sheets
        try {
          const parsedRowIndex = (() => {
            try {
              const parts = editingStudentId.split('-');
              const last = parts[parts.length - 1];
              const num = parseInt(last, 10);
              return Number.isFinite(num) ? num : undefined;
            } catch {
              return undefined;
            }
          })();
          const response = await fetch('/api/sba/update-student', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentName: formData.studentName,
              className: className,
              subject: selectedSubject,
              term: selectedTerm,
              rowIndex: parsedRowIndex,
              scores: {
                individualTestScore: formData.individualTestScore,
                classTestScore: formData.classTestScore,
                examScore: formData.examScore
              }
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update student data');
          }

          const result = await response.json();
          console.log('Student data updated successfully:', result);

          // Update local state after successful API call
          const updatedRecords = assessmentData?.records.map(record => 
            record.id === editingStudentId 
              ? {
                  ...record,
                  studentName: formData.studentName,
                  individualTestScore: formData.individualTestScore,
                  classTestScore: formData.classTestScore,
                  totalClassScore: derivedFields.totalClassScore,
                  scaledClassScore: derivedFields.scaledClassScore,
                  examScore: formData.examScore,
                  scaledExamScore: derivedFields.scaledExamScore,
                  overallTotal: derivedFields.overallTotal
                }
              : record
          ) || [];

          const recordsWithPosition = calculatePosition(updatedRecords);

          const updatedData: SBAAssessmentData = {
            subject: assessmentData?.subject || selectedSubject,
            term: assessmentData?.term || selectedTerm,
            className: assessmentData?.className || className,
            records: recordsWithPosition
          };

          setAssessmentData(updatedData);
        } catch (error) {
          console.error('Error updating student data:', error);
          setError('Failed to update student data. Please try again.');
          return;
        }
      } else {
        // Adding new student - save to Google Sheets
        try {
          const response = await fetch('/api/sba/create-student', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentName: formData.studentName,
              className: className,
              subject: selectedSubject,
              term: selectedTerm,
              scores: {
                individualTestScore: formData.individualTestScore,
                classTestScore: formData.classTestScore,
                examScore: formData.examScore
              }
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to add student data');
          }

          const result = await response.json();
          console.log('Student data added successfully:', result);

          // Check if student already exists in current assessment data
          const existingStudent = assessmentData?.records.find(record => record.studentName === formData.studentName);
          if (existingStudent) {
            alert('This student already has assessment data for this subject and term. Please edit the existing record instead.');
            return;
          }

          // Find the selected student to get their ID
          const selectedStudent = students.find(s => s.studentName === formData.studentName);

          const newStudent: Student = {
            id: selectedStudent ? selectedStudent.id : `sba-${className.toLowerCase()}-${selectedSubject.toLowerCase()}-${Date.now()}`,
            studentName: formData.studentName,
            individualTestScore: formData.individualTestScore,
            classTestScore: formData.classTestScore,
            totalClassScore: derivedFields.totalClassScore,
            scaledClassScore: derivedFields.scaledClassScore,
            examScore: formData.examScore,
            scaledExamScore: derivedFields.scaledExamScore,
            overallTotal: derivedFields.overallTotal,
            position: '' // Will be calculated after adding to array
          };

          const updatedRecords = assessmentData ? [...assessmentData.records, newStudent] : [newStudent];
          const recordsWithPosition = calculatePosition(updatedRecords);

          const updatedData: SBAAssessmentData = {
            subject: assessmentData?.subject || selectedSubject,
            term: assessmentData?.term || selectedTerm,
            className: assessmentData?.className || className,
            records: recordsWithPosition
          };

          setAssessmentData(updatedData);
        } catch (error) {
          console.error('Error adding student data:', error);
          setError('Failed to add student data. Please try again.');
          return;
        }
      }

      // Reset form and close modal
      setShowForm(false);
      setFormData({
        studentName: '',
        individualTestScore: '',
        classTestScore: '',
        examScore: ''
      });
      setEditingStudentId(null);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save student data');
    }
  };

  useEffect(() => {
    if (className && selectedSubject) {
      fetchSBAData();
      fetchStudents();
    }
  }, [className, selectedSubject, selectedTerm]);

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      setDebugInfo(`Fetching students for class: "${className}"`);
      console.log('Fetching students for class:', className);
      const studentsData = await getStudentsByClass(className);
      console.log('Fetched students data:', studentsData);
      setStudents(studentsData);
      setDebugInfo(`Successfully loaded ${studentsData.length} students for class "${className}"`);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      const errorMessage = `Failed to load student names: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setDebugInfo(errorMessage);
      setError('Failed to load student names. Please try again.');
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchSBAData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/sba/class-assessment?className=${encodeURIComponent(className)}&subject=${encodeURIComponent(selectedSubject)}&term=${encodeURIComponent(selectedTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch SBA data');
      }
      
      const data = await response.json();
      
      console.log('Received SBA data:', data); // Debug log
      
      // Validate the data structure
      if (!data || !data.records || !Array.isArray(data.records)) {
        console.error('Invalid data structure:', data); // Debug log
        throw new Error('Invalid data format received from server');
      }
      
      setAssessmentData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SBA data');
    } finally {
      setLoading(false);
    }
  };

  if (!className) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Invalid class name</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Link
              href="/teacher/sba-assessment"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Classes
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{className} SBA Assessment</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Link
              href="/teacher/sba-assessment"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Classes
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{className} SBA Assessment</h1>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/teacher/sba-assessment"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Classes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{className} SBA Assessment</h1>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <SubjectSelector
                currentSubject={selectedSubject}
                availableSubjects={subjects}
                onSubjectChange={setSelectedSubject}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {terms.map((term, index) => (
                  <option key={term} value={term}>
                    {termLabels[index]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </button>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={updatePositionsInSheet}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
              >
                Update Positions
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Data */}
        {assessmentData && assessmentData.records && assessmentData.records.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {assessmentData.subject} - {termLabels[parseInt(assessmentData.term) - 1]}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Individual Test (30mks)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Test (30mks)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Class Score (60mks)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      60 Scaled to (50%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End of Term Exams
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      100 Scaled to (50%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessmentData.records.map((student, index) => (
                    <tr key={student.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {student.studentName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.individualTestScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.classTestScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        {student.totalClassScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {student.scaledClassScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.examScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {student.scaledExamScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {student.overallTotal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        {student.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-4">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewReport(student.id, student.studentName)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {assessmentData && (!assessmentData.records || assessmentData.records.length === 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No assessment data found for {selectedSubject} - {termLabels[parseInt(selectedTerm) - 1]}</p>
              <p className="text-sm mt-2">Please check if data has been entered for this subject and term.</p>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {debugInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Information:</h3>
            <p className="text-sm text-yellow-700">{debugInfo}</p>
            <p className="text-xs text-yellow-600 mt-1">Class: "{className}" | Students: {students.length} | Loading: {studentsLoading.toString()}</p>
          </div>
        )}
        
        {/* Add Student Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit Student Data' : 'Add Student Data'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingStudentId(null);
                    setIsEditing(false);
                    setFormData({
                      studentName: '',
                      individualTestScore: '',
                      classTestScore: '',
                      examScore: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <select
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={studentsLoading || isEditing}
                  >
                    <option value="">Select a student</option>
                    {studentsLoading ? (
                      <option value="" disabled>Loading students...</option>
                    ) : (
                      students.map((student) => (
                        <option key={student.id} value={student.studentName}>
                          {student.studentName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Individual Test (30mks)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.individualTestScore}
                    onChange={(e) => setFormData({...formData, individualTestScore: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0-30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Test (30mks)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.classTestScore}
                    onChange={(e) => setFormData({...formData, classTestScore: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0-30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End of Term Exams
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.examScore}
                    onChange={(e) => setFormData({...formData, examScore: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0-100"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingStudentId(null);
                      setIsEditing(false);
                      setFormData({
                        studentName: '',
                        individualTestScore: '',
                        classTestScore: '',
                        examScore: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {isEditing ? 'Update Student' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
