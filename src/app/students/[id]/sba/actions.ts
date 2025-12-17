'use server';

import { revalidatePath } from 'next/cache';

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
    // For now, just revalidate the path to refresh the data
    // In a real implementation, you would update the Google Sheet here
    revalidatePath(`/students/${data.studentId}/sba`);
    
    // Return void as expected by the component
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
}