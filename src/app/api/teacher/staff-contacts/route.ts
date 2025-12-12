import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function GET() {
  try {
    const googleSheetsService = new GoogleSheetsService();
    
    // Fetch teachers data from Google Sheets
    const result = await googleSheetsService.getSheetData('Teachers');
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to fetch teachers data', 
        details: result.message 
      }, { status: 500 });
    }
    
    const rows = result.data || [];
    
    // Skip header row and map teacher data
    const teachers = rows.slice(1).map((row: any[], index: number) => {
      // Map the Google Sheets columns to our staff member interface
      // Based on the Teachers sheet structure: name, email, phone, class, username, password, subject, classes
      return {
        id: `teacher-${index + 1}`,
        name: row[0] || 'Unknown Teacher',
        username: row[4] || `teacher${index + 1}`,
        email: row[1] || `${row[4] || 'teacher'}@school.edu.gh`,
        phone: row[2] || '+233 24 XXX XXXX',
        role: 'teacher',
        department: row[6] || 'General Subjects',
        status: 'active',
        // Additional fields that might be useful
        class: row[3] || 'Not assigned',
        subject: row[6] || 'General',
      };
    }).filter((teacher: any) => teacher.name !== 'Unknown Teacher' || teacher.username !== `teacher${teachers.indexOf(teacher) + 1}`);
    
    // Also fetch non-teaching staff data (optional - handle gracefully if sheet doesn't exist)
    let nonTeachingStaff = [];
    try {
      const nonTeachersResult = await googleSheetsService.getSheetData('Non-Teaching-Staff');
      
      if (nonTeachersResult.success && nonTeachersResult.data && nonTeachersResult.data.length > 1) {
        nonTeachingStaff = nonTeachersResult.data.slice(1).map((row: any[], index: number) => {
          return {
            id: `non-teacher-${index + 1}`,
            name: row[0] || 'Unknown Staff',
            username: row[1] || `staff${index + 1}`,
            email: row[2] || `${row[1] || 'staff'}@school.edu.gh`,
            phone: row[3] || '+233 24 XXX XXXX',
            role: row[4] || 'admin', // Default role from the sheet
            department: row[5] || 'Administration',
            status: 'active',
          };
        });
      }
    } catch (error) {
      console.log('Non-Teaching-Staff sheet not found or error accessing it, continuing with teachers only');
      // Continue with just teachers data
    }
    
    // Combine all staff members
    const allStaff = [...teachers, ...nonTeachingStaff];
    
    return NextResponse.json({ 
      success: true, 
      staff: allStaff,
      counts: {
        teachers: teachers.length,
        nonTeachingStaff: nonTeachingStaff.length,
        total: allStaff.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching staff contacts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch staff contacts', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}