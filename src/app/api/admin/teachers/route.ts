import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, status, username, password, contact, location, employmentDate, dateStopped, adminPrivileges } = body;
    const teacherClass = body.class;

    if (!name || !teacherClass || !role || !status || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const googleSheetsService = new GoogleSheetsService();
    
    // Get current teachers data to find the next row
    const result = await googleSheetsService.getSheetData('Teachers');
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch current teachers data' },
        { status: 500 }
      );
    }

    const rows = result.data;
    const newRowIndex = rows.length; // Next available row

    // Prepare the new teacher data
    const newTeacherData = [
      name,
      teacherClass,
      role,
      status,
      username,
      password,
      contact || '',
      location || '',
      employmentDate || '',
      dateStopped || '',
      adminPrivileges || 'No'
    ];

    // Append the new teacher to the sheet
    const appendResult = await googleSheetsService.appendToSheet('Teachers', newTeacherData);
    
    if (!appendResult.success) {
      return NextResponse.json(
        { success: false, message: appendResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher added successfully',
      data: { name, class: teacherClass, role, status, username, password, contact, location, employmentDate, dateStopped }
    });

  } catch (error) {
    console.error('Error adding teacher:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, name, role, status, username, password, contact, location, employmentDate, dateStopped, adminPrivileges } = body;
    const teacherClass = body.class;

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required for updating' },
        { status: 400 }
      );
    }

    const googleSheetsService = new GoogleSheetsService();
    
    // Prepare only the fields that need to be updated (undefined fields won't be changed)
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (teacherClass !== undefined) updates.class = teacherClass;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    if (password !== undefined && password !== '') updates.password = password;
    if (contact !== undefined) updates.contact = contact;
    if (location !== undefined) updates.location = location;
    if (employmentDate !== undefined) updates.employmentDate = employmentDate;
    if (dateStopped !== undefined) updates.dateStopped = dateStopped;
    if (adminPrivileges !== undefined) updates.adminPrivileges = adminPrivileges;

    // Use the new targeted update method that finds by username and only updates specified fields
    const updateResult = await googleSheetsService.updateStaffByUsername('Teachers', username, updates);
    
    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, message: updateResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher updated successfully',
      data: { 
        username, 
        updatedFields: Object.keys(updates),
        rowIndex: updateResult.data?.rowIndex 
      }
    });

  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rowIndex = searchParams.get('rowIndex');

    if (!rowIndex) {
      return NextResponse.json(
        { success: false, message: 'Missing rowIndex parameter' },
        { status: 400 }
      );
    }

    const googleSheetsService = new GoogleSheetsService();
    
    // Delete the specific row (rowIndex + 1 to account for header row)
    const deleteResult = await googleSheetsService.deleteRowFromSheet('Teachers', parseInt(rowIndex) + 1);
    
    if (!deleteResult.success) {
      return NextResponse.json(
        { success: false, message: deleteResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}