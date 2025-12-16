import { notFound } from 'next/navigation';
import { getStudentById } from '@/lib/data';
import { getSBAClassAssessment, getAvailableSubjectsForClass } from '@/lib/sba-assessment';
import { getSBAConfig } from '@/lib/sba-config';
import { SBAClientContent } from './sba-client-content';

export default async function StudentSBAPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ class?: string, subject?: string, term?: string }> 
}) {
  const { id } = await params;
  const sp = await searchParams;
  const student = await getStudentById(id);
  
  if (!student) return notFound();
  
  const className = sp?.class || student.class;
  const subject = sp?.subject || 'Mathematics'; // Default subject
  const term = sp?.term || 'Term 1'; // Default term
  
  // Fetch SBA config
  const sbaConfig = await getSBAConfig();
  
  // Fetch available subjects for this class and term
  const availableSubjects = await getAvailableSubjectsForClass(className, term);
  
  // If no subjects found, add the default subject
  const subjects = availableSubjects.length > 0 ? availableSubjects : [subject];
  
  // Fetch initial assessment data
  const initialAssessmentData = await getSBAClassAssessment(className, subject, term);

  return (
    <SBAClientContent
      student={student}
      className={className}
      term={term}
      availableSubjects={subjects}
      initialSubject={subject}
      initialAssessmentData={initialAssessmentData}
      sbaConfig={sbaConfig}
    />
  );
}
