import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, department, role, status, username, password, contact, location, dateCreated, dateUpdated } = body;

    if (!name || !department || !role || !status || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const googleSheetsService = new GoogleSheetsService();
    
    // Get current non-teachers data to find the next row
    const result = await googleSheetsService.getSheetData('Non-Teaching');
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch current non-teachers data' },
        { status: 500 }
      );
    }

    const rows = result.data;
    const newRowIndex = rows.length; // Next available row

    // Prepare the new non-teacher data
    const newNonTeacherData = [
      name,
      department,
      role,
      status,
      username,
      password,
      contact || '',
      location || '',
      dateCreated || new Date().toISOString().split('T')[0],
      dateUpdated || new Date().toISOString().split('T')[0]
    ];

    // Append the new non-teacher to the sheet
    const appendResult = await googleSheetsService.appendToSheet('Non-Teaching', newNonTeacherData);
    
    if (!appendResult.success) {
      return NextResponse.json(
        { success: false, message: appendResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Non-teaching staff added successfully',
      data: { name, department, role, status, username, password, contact, location, dateCreated, dateUpdated }
    });

  } catch (error) {
    console.error('Error adding non-teaching staff:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, name, department, role, status, username, password, contact, location, dateCreated, dateUpdated } = body;

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
    if (department !== undefined) updates.department = department;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    if (password !== undefined && password !== '') updates.password = password;
    if (contact !== undefined) updates.contact = contact;
    if (location !== undefined) updates.location = location;
    if (dateCreated !== undefined) updates.dateCreated = dateCreated;
    if (dateUpdated !== undefined) updates.dateUpdated = dateUpdated;

    // Use the new targeted update method that finds by username and only updates specified fields
    const updateResult = await googleSheetsService.updateStaffByUsername('Non-Teachers', username, updates);
    
    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, message: updateResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Non-teaching staff updated successfully',
      data: { 
        username, 
        updatedFields: Object.keys(updates),
        rowIndex: updateResult.data?.rowIndex 
      }
    });

  } catch (error) {
    console.error('Error updating non-teaching staff:', error);
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
    const deleteResult = await googleSheetsService.deleteRowFromSheet('Non-Teaching', parseInt(rowIndex) + 1);
    
    if (!deleteResult.success) {
      return NextResponse.json(
        { success: false, message: deleteResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Non-teaching staff deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting non-teaching staff:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}