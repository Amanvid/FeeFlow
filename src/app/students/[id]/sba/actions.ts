'use server';

import { revalidatePath } from 'next/cache';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { getStudentById } from '@/lib/data';

export async function submitAssessment(data: {
  studentId: string;
  subject: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  term: string;
  className: string;
}) {
  try {
    const student = await getStudentById(data.studentId);
    const studentName = student ? student.studentName : 'Unknown';

    const sheetsService = new GoogleSheetsService();
    
    // Calculate percentage and grade
    const percentage = data.maxScore > 0 ? (data.score / data.maxScore) * 100 : 0;
    
    let grade = 'F';
    if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else if (percentage >= 45) grade = 'E';
    
    // Structure matches getSBARecords in src/lib/data.ts
    // ['ID','Student ID','Student Name','Class','Subject','Term','Academic Year','Assessment Type','Score','Total Marks','Percentage','Grade','Remarks','Date','Teacher ID','Teacher Name','Created At','Updated At']
    
    const row = [
      `SBA-${Date.now()}`, // ID
      data.studentId, // Student ID
      studentName, // Student Name
      data.className, // Class
      data.subject, // Subject
      data.term, // Term
      new Date().getFullYear().toString(), // Academic Year (Approximate)
      data.assessmentType, // Assessment Type
      data.score, // Score
      data.maxScore, // Total Marks
      percentage.toFixed(2), // Percentage
      grade, // Grade
      '', // Remarks
      new Date().toISOString().split('T')[0], // Date
      '', // Teacher ID
      '', // Teacher Name
      new Date().toISOString(), // Created At
      new Date().toISOString() // Updated At
    ];

    await sheetsService.appendToSheet('SBA', [row]);
    
    revalidatePath(`/students/${data.studentId}/sba`);
    revalidatePath(`/students/${data.studentId}/report`);
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw new Error('Failed to submit assessment');
  }
}
