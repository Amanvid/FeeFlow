export interface SBAClassRecord {
  id: string;
  studentNumber: number;
  studentName: string;
  individualTestScore: number | string;  // Indv. Test (30mks) - can be empty string
  classTestScore: number | string;       // Class Test (30mks) - can be empty string
  totalClassScore: number | string;     // Total Class Score (60 marks) - can be empty string
  scaledClassScore: number | string;     // 60 MKS SCALED TO (50%) - can be empty string
  examScore: number | string;            // End of Term Exam (100 MKS) - can be empty string
  scaledExamScore: number | string;      // 100 MKS SCALED TO (50%) - can be empty string
  overallTotal: number | string;         // Overall Total - can be empty string
  position: number | string;            // Position - can be empty string
  subject?: string;              // Subject (for filtering)
  term?: string;                 // Term (for filtering)
  academicYear?: string;         // Academic Year
  teacherName?: string;          // Teacher Name
  date?: string;                 // Date
}

export interface SBAClassData {
  className: string;
  subject: string;
  term: string;
  teacherName: string;
  records: SBAClassRecord[];
}