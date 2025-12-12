"use server";

import { v4 as uuid } from 'uuid';
import { GoogleSheetsService } from '@/lib/google-sheets';

function gradeFromPercentage(p: number): string {
  if (p >= 80) return 'A';
  if (p >= 70) return 'B';
  if (p >= 60) return 'C';
  if (p >= 50) return 'D';
  if (p >= 40) return 'E';
  return 'F';
}

export async function submitAssessment(data: {
  studentId: string;
  subject: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  term: string;
  className: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const percentage = Math.round((data.score / data.maxScore) * 100);
    const grade = gradeFromPercentage(percentage);
    const now = new Date();
    const createdAt = now.toISOString();

    const row = [
      uuid(),
      data.studentId,
      '',
      data.className,
      data.subject,
      data.term,
      '',
      data.assessmentType,
      String(data.score),
      String(data.maxScore),
      String(percentage),
      grade,
      '',
      now.toLocaleDateString(),
      '',
      '',
      createdAt,
      createdAt,
    ];

    const sheets = new GoogleSheetsService();
    const headers = [
      'ID','Student ID','Student Name','Class','Subject','Term','Academic Year','Assessment Type','Score','Total Marks','Percentage','Grade','Remarks','Date','Teacher ID','Teacher Name','Created At','Updated At'
    ];

    const existing = await sheets.getSheetData('SBA');
    if (!existing.success || !existing.data || existing.data.length === 0) {
      await sheets.createSheet('SBA');
      await sheets.appendToSheet('SBA', [headers]);
    }

    const res = await sheets.appendToSheet('SBA', [row]);
    if (res.success) {
      return { success: true, message: 'Assessment added successfully' };
    }
    return { success: false, message: 'Failed to add assessment' };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Unknown error' };
  }
}

