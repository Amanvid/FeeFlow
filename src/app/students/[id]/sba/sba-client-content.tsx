'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SBAClassAssessment } from '@/components/sba-class-assessment';
import { StudentAssessmentForm } from '@/components/student-assessment-form';
import { SubjectSelector } from '@/components/subject-selector';
import { SBAConfig } from '@/lib/sba-config';

interface SBAClientContentProps {
  student: {
    id: string;
    studentName: string;
    class: string;
  };
  className: string;
  term: string;
  availableSubjects: string[];
  initialSubject: string;
  initialAssessmentData: any;
  onSubmitAssessment: (data: {
    studentId: string;
    subject: string;
    assessmentType: string;
    score: number;
    maxScore: number;
    term: string;
    className: string;
  }) => Promise<void>;
  sbaConfig: SBAConfig;
}

export function SBAClientContent({ 
  student, 
  className, 
  term, 
  availableSubjects, 
  initialSubject, 
  initialAssessmentData,
  onSubmitAssessment,
  sbaConfig
}: SBAClientContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSubject, setCurrentSubject] = useState(initialSubject);
  const [assessmentData, setAssessmentData] = useState(initialAssessmentData);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubjectChange = async (subject: string) => {
    setIsLoading(true);
    setCurrentSubject(subject);
    
    // Update URL search params
    const params = new URLSearchParams(searchParams.toString());
    params.set('subject', subject);
    router.push(`?${params.toString()}`);
    
    try {
      // Fetch new assessment data for the selected subject
      const response = await fetch(`/api/sba/class-assessment?className=${encodeURIComponent(className)}&subject=${encodeURIComponent(subject)}&term=${encodeURIComponent(term)}`);
      
      if (response.ok) {
        const data = await response.json();
        setAssessmentData(data);
      } else {
        setAssessmentData(null);
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      setAssessmentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update assessment data when initial data changes
  useEffect(() => {
    setAssessmentData(initialAssessmentData);
  }, [initialAssessmentData]);

  const totalClassSubjectsScore =
    Array.isArray(assessmentData?.records)
      ? assessmentData.records.reduce(
          (sum: number, r: any) =>
            sum + (typeof r.overallTotal === 'number' ? r.overallTotal : 0),
          0
        )
      : 0;

  const highestStudentTotal =
    Array.isArray(assessmentData?.records) && assessmentData.records.length > 0
      ? Math.max(
          ...assessmentData.records.map((r: any) =>
            typeof r.overallTotal === 'number' ? r.overallTotal : 0
          )
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SBA Assessment</h1>
          <p className="text-muted-foreground">{className} • {currentSubject} • {term}</p>
        </div>
        <Badge variant="secondary">{currentSubject}</Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Class Subjects Score</span>
              <p className="font-medium">{totalClassSubjectsScore}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Class</span>
              <p className="font-medium">{className}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Highest Student Total</span>
              <p className="font-medium">{highestStudentTotal}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Selector */}
      <SubjectSelector
        currentSubject={currentSubject}
        availableSubjects={availableSubjects}
        onSubjectChange={handleSubjectChange}
      />

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading assessment data...</p>
          </CardContent>
        </Card>
      )}

      {/* Class-wide assessment view */}
      {!isLoading && assessmentData && (
        <SBAClassAssessment
          teacherName={assessmentData.teacherName}
          subject={assessmentData.subject}
          className={assessmentData.className}
          records={assessmentData.records.map((record: any) => ({
            id: record.id,
            studentName: record.studentName,
            individualTestScore: record.individualTest,
            classTestScore: record.classTest,
            totalClassScore: record.totalClassScore,
            scaledClassScore: record.scaledTo30,
            examScore: record.endOfTermExam,
            scaledExamScore: record.scaledTo70,
            overallTotal: record.overallTotal,
            position: record.position
          }))}
        />
      )}

      {!isLoading && !assessmentData && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No SBA class assessment data found for {currentSubject} - {term}</p>
          </CardContent>
        </Card>
      )}

      {/* Add assessment form */}
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Add New Assessment</h2>
        <StudentAssessmentForm
          students={[{ id: student.id, name: student.studentName }]}
          subjects={[currentSubject]}
          classes={[className]}
          onSubmit={onSubmitAssessment}
        />
      </div>
    </div>
  );
}
