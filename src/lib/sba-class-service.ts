import { GoogleSheetsService } from './google-sheets';
import { SBAClassData, SBAClassRecord } from './sba-class-types';

export async function getSBAClassDataFromSheet(
  className: string, 
  subject: string, 
  term: string
): Promise<SBAClassData | null> {
  try {
    // Handle Creche class with special multi-subject structure
    if (className === 'Creche') {
      return await getCrecheSBAData(subject, term);
    }
    
    const sheetsService = new GoogleSheetsService();
    
    // Map class names to sheet names
    const sheetNameMap: { [key: string]: string } = {
      'Creche': 'SBA Creche',
      'BS 1': 'SBA BS1',
      'BS 2': 'SBA BS2', 
      'BS 3': 'SBA BS3',
      'BS 4': 'SBA BS4',
      'BS 5': 'SBA BS5'
    };
    
    const sheetName = sheetNameMap[className] || `SBA ${className}`;
    
    // Try to get data from the class-specific sheet
    let result = await sheetsService.getSheetData(sheetName);
    
    if (!result.success || !result.data || result.data.length <= 1) {
      console.log(`No data found in ${sheetName}, creating sample structure...`);
      return createSampleSBAClassData(className, subject, term);
    }
    
    const rows = result.data;
    const headers: string[] = rows[0].map((h: unknown) => (h ? String(h).trim() : ''));
    
    // Find column indices
    const getIndex = (name: string) => headers.findIndex((h: string) => 
      h.toLowerCase().includes(name.toLowerCase())
    );
    
    const indices = {
      no: getIndex('no.'),
      studentName: getIndex('student name'),
      individualTest: getIndex('indv. test'),
      classTest: getIndex('class test'),
      totalClassScore: getIndex('total class score'),
      scaledClassScore: getIndex('scaled'),
      examScore: getIndex('exam'),
      scaledExamScore: getIndex('scaled'),
      overallTotal: getIndex('overall total'),
      position: getIndex('position'),
      subject: getIndex('subject'),
      term: getIndex('term'),
      teacherName: getIndex('teacher')
    };
    
    const records: SBAClassRecord[] = [];
    
    // Process data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((cell: any) => !cell)) continue; // Skip empty rows
      
      const toStr = (index: number) => index >= 0 ? String(row[index] || '').trim() : '';
      const toNum = (index: number) => {
        const str = toStr(index);
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
      };
      
      const record: SBAClassRecord = {
        id: `sba-${className}-${i}`,
        studentNumber: toNum(indices.no) || i,
        studentName: toStr(indices.studentName),
        individualTestScore: toNum(indices.individualTest),
        classTestScore: toNum(indices.classTest),
        totalClassScore: toNum(indices.totalClassScore),
        scaledClassScore: toNum(indices.scaledClassScore),
        examScore: toNum(indices.examScore),
        scaledExamScore: toNum(indices.scaledExamScore),
        overallTotal: toNum(indices.overallTotal),
        position: toNum(indices.position),
        subject: toStr(indices.subject) || subject,
        term: toStr(indices.term) || term,
        teacherName: toStr(indices.teacherName)
      };
      
      if (record.studentName) {
        records.push(record);
      }
    }
    
    // Filter by subject and term if specified
    const filteredRecords = records.filter(record => {
      const subjectMatch = !subject || record.subject === subject;
      const termMatch = !term || record.term === term;
      return subjectMatch && termMatch;
    });
    
    // Get teacher name from first record or use default
    const teacherName = filteredRecords[0]?.teacherName || 'Mr. Smith';
    
    return {
      className,
      subject,
      term,
      teacherName,
      records: filteredRecords
    };
    
  } catch (error) {
    console.error(`Error fetching SBA data for ${className}:`, error);
    return createSampleSBAClassData(className, subject, term);
  }
}

function createSampleSBAClassData(className: string, subject: string, term: string): SBAClassData {
  return {
    className,
    subject,
    term,
    teacherName: 'Mr. Smith',
    records: [
      {
        id: 'sba-1',
        studentNumber: 1,
        studentName: 'Abubakar Ifatmat',
        individualTestScore: 85,
        classTestScore: 78,
        totalClassScore: 163,
        scaledClassScore: 30,
        examScore: 50,
        scaledExamScore: 35,
        overallTotal: 65,
        position: 1,
        subject,
        term
      },
      {
        id: 'sba-2',
        studentNumber: 2,
        studentName: 'Fatima Bello',
        individualTestScore: 67,
        classTestScore: 74,
        totalClassScore: 141,
        scaledClassScore: 30,
        examScore: 50,
        scaledExamScore: 35,
        overallTotal: 65,
        position: 2,
        subject,
        term
      }
    ]
  };
}

async function getCrecheSBAData(subject: string, term: string): Promise<SBAClassData | null> {
  try {
    const sheetsService = new GoogleSheetsService();
    const sheetName = 'SBA Creche';
    
    // Get data from the Creche sheet
    const result = await sheetsService.getSheetData(sheetName);
    
    if (!result.success || !result.data || result.data.length <= 1) {
      console.log('No data found in SBA Creche sheet');
      return createSampleCrecheSBAData(subject, term);
    }
    
    const rows = result.data;
    const records: SBAClassRecord[] = [];
    
    // Determine which section to read based on subject
    let startRow = 3; // Skip headers (Literacy/Numeracy section starts at row 4)
    let subjectColumnMap: { [key: string]: number } = {};
    
    if (subject === 'Literacy') {
      // Literacy columns: C (Individual Test), D (Class Test), H (Overall Total), I (Position)
      subjectColumnMap = {
        individualTest: 2,  // Column C
        classTest: 3,       // Column D
        overallTotal: 7,    // Column H
        position: 8         // Column I
      };
    } else if (subject === 'Numeracy') {
      // Numeracy columns: K (Individual Test), L (Class Test), P (Overall Total), Q (Position)
      subjectColumnMap = {
        individualTest: 10, // Column K
        classTest: 11,      // Column L
        overallTotal: 15,   // Column P
        position: 16        // Column Q
      };
    } else if (subject === 'Colouring') {
      // Colouring section starts at row 14
      startRow = 13; // Skip to Colouring/Scribbling section
      subjectColumnMap = {
        individualTest: 2,  // Column C
        classTest: 3,       // Column D
        overallTotal: 7,    // Column H
        position: 8         // Column I
      };
    } else if (subject === 'Scribbling') {
      // Scribbling section starts at row 14
      startRow = 13; // Skip to Colouring/Scribbling section
      subjectColumnMap = {
        individualTest: 10, // Column K
        classTest: 11,      // Column L
        overallTotal: 15,   // Column P
        position: 16        // Column Q
      };
    } else {
      // Default to Literacy if no subject specified
      subject = 'Literacy';
      subjectColumnMap = {
        individualTest: 2,
        classTest: 3,
        overallTotal: 7,
        position: 8
      };
    }
    
    // Process data rows for the selected section
    for (let i = startRow; i < rows.length && i < startRow + 6; i++) {
      const row = rows[i];
      if (!row || row.every((cell: any) => !cell)) continue; // Skip empty rows
      
      const toStr = (index: number) => index >= 0 ? String(row[index] || '').trim() : '';
      const toNum = (index: number) => {
        const str = toStr(index);
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
      };
      
      const studentName = toStr(1); // Column B
      if (!studentName) continue; // Skip empty student names
      
      const individualTestScore = toNum(subjectColumnMap.individualTest);
      const classTestScore = toNum(subjectColumnMap.classTest);
      const totalClassScore = individualTestScore + classTestScore;
      const overallTotal = toNum(subjectColumnMap.overallTotal);
      const position = toNum(subjectColumnMap.position);
      
      // Calculate scaled scores (60 scaled to 50%)
      const scaledClassScore = Math.round((totalClassScore / 60) * 50);
      const examScore = 50; // Default exam score
      const scaledExamScore = 25; // 50% of exam score
      
      const record: SBAClassRecord = {
        id: `sba-creche-${subject.toLowerCase()}-${i}`,
        studentNumber: records.length + 1,
        studentName,
        individualTestScore,
        classTestScore,
        totalClassScore,
        scaledClassScore,
        examScore,
        scaledExamScore,
        overallTotal: overallTotal || (scaledClassScore + scaledExamScore),
        position,
        subject,
        term,
        teacherName: 'Ms. Johnson'
      };
      
      records.push(record);
    }
    
    return {
      className: 'Creche',
      subject,
      term,
      teacherName: 'Ms. Johnson',
      records
    };
    
  } catch (error) {
    console.error('Error fetching Creche SBA data:', error);
    return createSampleCrecheSBAData(subject, term);
  }
}

function createSampleCrecheSBAData(subject: string, term: string): SBAClassData {
  return {
    className: 'Creche',
    subject,
    term,
    teacherName: 'Ms. Johnson',
    records: [
      {
        id: `sba-creche-${subject.toLowerCase()}-1`,
        studentNumber: 1,
        studentName: 'Aliya Ibrahim',
        individualTestScore: 85,
        classTestScore: 78,
        totalClassScore: 163,
        scaledClassScore: 30,
        examScore: 50,
        scaledExamScore: 25,
        overallTotal: 55,
        position: 1,
        subject,
        term
      },
      {
        id: `sba-creche-${subject.toLowerCase()}-2`,
        studentNumber: 2,
        studentName: 'Almeyaw Salisu Suleman',
        individualTestScore: 67,
        classTestScore: 74,
        totalClassScore: 141,
        scaledClassScore: 30,
        examScore: 50,
        scaledExamScore: 25,
        overallTotal: 55,
        position: 2,
        subject,
        term
      }
    ]
  };
}
