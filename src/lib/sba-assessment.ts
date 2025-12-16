import { getSBARecords } from './data';
import { getSBAClassDataFromSheet } from './sba-class-service';
import { SBAClassData, SBAClassRecord } from './sba-class-types';

export interface SBAAssessmentRecord {
  id: string;
  studentName: string;
  individualTestScore: number | string;
  classTestScore: number | string;
  totalClassScore: number | string;
  scaledClassScore: number | string;
  examScore: number | string;
  scaledExamScore: number | string;
  overallTotal: number | string;
  position: number | string;
}

export interface SBAAssessmentData {
  teacherName: string;
  subject: string;
  className: string;
  records: SBAAssessmentRecord[];
}

export async function getSBAAssessmentData(studentId: string, className: string, subject: string, term: string): Promise<SBAAssessmentData | null> {
  try {
    const allRecords = await getSBARecords();
    
    // Filter records for the specific class, subject, and term
    const filteredRecords = allRecords.filter(record => 
      record.className === className && 
      record.subject === subject && 
      record.term === term
    );

    if (filteredRecords.length === 0) {
      return null;
    }

    // Group by student and calculate scores
    const studentScores = new Map<string, {
      studentName: string;
      individualTest: number;
      classTest: number;
      endOfTermExam: number;
      totalAssessments: number;
    }>();

    filteredRecords.forEach(record => {
      const key = record.studentId;
      const existing = studentScores.get(key) || {
        studentName: record.studentName,
        individualTest: 0,
        classTest: 0,
        endOfTermExam: 0,
        totalAssessments: 0
      };

      // Categorize assessments based on type
      if (record.assessmentType.toLowerCase().includes('test')) {
        existing.individualTest += record.score;
      } else if (record.assessmentType.toLowerCase().includes('quiz')) {
        existing.classTest += record.score;
      } else if (record.assessmentType.toLowerCase().includes('exam')) {
        existing.endOfTermExam += record.score;
      } else {
        // Default categorization - assign to individual test
        existing.individualTest += record.score;
      }
      
      existing.totalAssessments++;
      studentScores.set(key, existing);
    });

    // Calculate final scores and rankings
    const assessmentRecords: SBAAssessmentRecord[] = Array.from(studentScores.entries()).map(([id, data]) => {
      // Calculate averages if multiple assessments of same type
      const individualTestRecords = filteredRecords.filter(r => 
        r.studentId === id && r.assessmentType.toLowerCase().includes('test')
      );
      
      const classTestRecords = filteredRecords.filter(r => 
        r.studentId === id && r.assessmentType.toLowerCase().includes('quiz')
      );
      
      const examRecords = filteredRecords.filter(r => 
        r.studentId === id && r.assessmentType.toLowerCase().includes('exam')
      );

      const individualTestAvg = individualTestRecords.length > 0 ? data.individualTest / individualTestRecords.length : 10;
      const classTestAvg = classTestRecords.length > 0 ? data.classTest / classTestRecords.length : 10;
      const endOfTermExamAvg = examRecords.length > 0 ? data.endOfTermExam / examRecords.length : 50; // Default exam score

      const totalClassScore = individualTestAvg + classTestAvg;
      const scaledClassScore = Math.min(30, totalClassScore);
      const scaledExamScore = Math.min(70, (endOfTermExamAvg / 100) * 70);
      const overallTotal = scaledClassScore + scaledExamScore;

      return {
        id,
        studentName: data.studentName,
        individualTestScore: individualTestAvg,
        classTestScore: classTestAvg,
        totalClassScore,
        scaledClassScore,
        examScore: endOfTermExamAvg,
        scaledExamScore,
        overallTotal,
        position: 0 // Will be calculated after sorting
      };
    });

    // Sort by overall total and assign positions
    assessmentRecords.sort((a, b) => Number(b.overallTotal) - Number(a.overallTotal));
    assessmentRecords.forEach((record, index) => {
      record.position = index + 1;
    });

    // Get teacher name from first record
    const teacherName = filteredRecords[0]?.teacherName || 'Unknown Teacher';

    return {
      teacherName,
      subject,
      className,
      records: assessmentRecords
    };
  } catch (error) {
    console.error('Error fetching SBA assessment data:', error);
    return null;
  }
}

export async function getStudentSBAAssessment(studentId: string, className: string, subject: string, term: string): Promise<SBAAssessmentRecord | null> {
  const assessmentData = await getSBAAssessmentData(studentId, className, subject, term);
  if (!assessmentData) return null;
  
  return assessmentData.records.find(record => record.id === studentId) || null;
}

export async function getAvailableSubjectsForClass(className: string, term: string): Promise<string[]> {
  try {
    const allRecords = await getSBARecords();
    
    // Filter records for the specific class and term
    const filteredRecords = allRecords.filter(record => 
      record.className === className && 
      record.term === term
    );

    // Get unique subjects
    const subjects = [...new Set(filteredRecords.map(record => record.subject))];
    
    // Sort subjects alphabetically
    return subjects.sort();
  } catch (error) {
    console.error('Error fetching available subjects:', error);
    return [];
  }
}

export async function getSBAClassAssessment(className: string, subject: string, term: string): Promise<SBAAssessmentData | null> {
  try {
    // Use the new class-specific sheet approach
    const classData = await getSBAClassDataFromSheet(className, subject, term);
    
    if (!classData || classData.records.length === 0) {
      return null;
    }

    // Convert the new format to the existing interface for compatibility
    const assessmentRecords: SBAAssessmentRecord[] = classData.records.map((record, index) => ({
      id: record.id,
      studentName: record.studentName,
      individualTestScore: record.individualTestScore,
      classTestScore: record.classTestScore,
      totalClassScore: record.totalClassScore,
      scaledClassScore: record.scaledClassScore,
      examScore: record.examScore,
      scaledExamScore: record.scaledExamScore,
      overallTotal: record.overallTotal,
      position: record.position
    }));

    return {
      teacherName: classData.teacherName,
      subject: classData.subject,
      className: classData.className,
      records: assessmentRecords
    };
  } catch (error) {
    console.error('Error fetching SBA class assessment data:', error);
    return null;
  }
}
