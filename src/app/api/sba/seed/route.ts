import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

const SHEET_NAME = 'SBA';
const DEMO_ROWS = [
  // Student 1: Abubakar Ifatmat, BS 2, Term 1
  ['1', '123-abubakarifatmat-123', 'Abubakar Ifatmat', 'BS 2', 'Mathematics', 'Term 1', '2024/2025', 'Test', '85', '100', '85', 'A', 'Excellent', '2025-01-15', 'T-001', 'Mr. Smith', '2025-01-15', '2025-01-15'],
  ['2', '123-abubakarifatmat-123', 'Abubakar Ifatmat', 'BS 2', 'Mathematics', 'Term 1', '2024/2025', 'Quiz', '78', '100', '78', 'B', 'Good', '2025-01-22', 'T-001', 'Mr. Smith', '2025-01-22', '2025-01-22'],
  ['3', '123-abubakarifatmat-123', 'Abubakar Ifatmat', 'BS 2', 'English', 'Term 1', '2024/2025', 'Test', '92', '100', '92', 'A', 'Outstanding', '2025-01-18', 'T-002', 'Ms. Jones', '2025-01-18', '2025-01-18'],
  ['4', '123-abubakarifatmat-123', 'Abubakar Ifatmat', 'BS 2', 'English', 'Term 1', '2024/2025', 'Quiz', '88', '100', '88', 'A', 'Very Good', '2025-01-25', 'T-002', 'Ms. Jones', '2025-01-25', '2025-01-25'],
  // Student 2: Fatima Bello, BS 2, Term 1
  ['5', '124-fatimabello-124', 'Fatima Bello', 'BS 2', 'Mathematics', 'Term 1', '2024/2025', 'Test', '67', '100', '67', 'C', 'Needs Improvement', '2025-01-15', 'T-001', 'Mr. Smith', '2025-01-15', '2025-01-15'],
  ['6', '124-fatimabello-124', 'Fatima Bello', 'BS 2', 'Mathematics', 'Term 1', '2024/2025', 'Quiz', '74', '100', '74', 'B', 'Good', '2025-01-22', 'T-001', 'Mr. Smith', '2025-01-22', '2025-01-22'],
  ['7', '124-fatimabello-124', 'Fatima Bello', 'BS 2', 'English', 'Term 1', '2024/2025', 'Test', '81', '100', '81', 'B', 'Good', '2025-01-18', 'T-002', 'Ms. Jones', '2025-01-18', '2025-01-18'],
  ['8', '124-fatimabello-124', 'Fatima Bello', 'BS 2', 'English', 'Term 1', '2024/2025', 'Quiz', '59', '100', '59', 'D', 'Poor', '2025-01-25', 'T-002', 'Ms. Jones', '2025-01-25', '2025-01-25'],
  // Student 3: John Doe, BS 3, Term 2
  ['9', '125-johndoe-125', 'John Doe', 'BS 3', 'Mathematics', 'Term 2', '2024/2025', 'Test', '90', '100', '90', 'A', 'Excellent', '2025-03-10', 'T-003', 'Mrs. Lee', '2025-03-10', '2025-03-10'],
  ['10', '125-johndoe-125', 'John Doe', 'BS 3', 'Mathematics', 'Term 2', '2024/2025', 'Quiz', '85', '100', '85', 'A', 'Very Good', '2025-03-17', 'T-003', 'Mrs. Lee', '2025-03-17', '2025-03-17'],
  ['11', '125-johndoe-125', 'John Doe', 'BS 3', 'English', 'Term 2', '2024/2025', 'Test', '77', '100', '77', 'B', 'Good', '2025-03-12', 'T-004', 'Mr. Brown', '2025-03-12', '2025-03-12'],
  ['12', '125-johndoe-125', 'John Doe', 'BS 3', 'English', 'Term 2', '2024/2025', 'Quiz', '69', '100', '69', 'C', 'Needs Improvement', '2025-03-19', 'T-004', 'Mr. Brown', '2025-03-19', '2025-03-19'],
  // Student 4: Aisha Musa, BS 1, Term 1
  ['13', '126-aishamusa-126', 'Aisha Musa', 'BS 1', 'Mathematics', 'Term 1', '2024/2025', 'Test', '55', '100', '55', 'E', 'Fail', '2025-01-12', 'T-005', 'Ms. Green', '2025-01-12', '2025-01-12'],
  ['14', '126-aishamusa-126', 'Aisha Musa', 'BS 1', 'Mathematics', 'Term 1', '2024/2025', 'Quiz', '62', '100', '62', 'D', 'Poor', '2025-01-19', 'T-005', 'Ms. Green', '2025-01-19', '2025-01-19'],
  ['15', '126-aishamusa-126', 'Aisha Musa', 'BS 1', 'English', 'Term 1', '2024/2025', 'Test', '73', '100', '73', 'C', 'Needs Improvement', '2025-01-14', 'T-006', 'Mr. White', '2025-01-14', '2025-01-14'],
  ['16', '126-aishamusa-126', 'Aisha Musa', 'BS 1', 'English', 'Term 1', '2024/2025', 'Quiz', '80', '100', '80', 'B', 'Good', '2025-01-21', 'T-006', 'Mr. White', '2025-01-21', '2025-01-21']
];

export async function POST() {
  try {
    const appendRes = await googleSheetsService.appendToSheet(SHEET_NAME, DEMO_ROWS);
    return NextResponse.json({ success: appendRes.success, rows: DEMO_ROWS.length });
  } catch (error) {
    console.error('Error seeding SBA sheet:', error);
    return NextResponse.json({ success: false, message: 'Failed to seed SBA sheet' }, { status: 500 });
  }
}