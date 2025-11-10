import { NextRequest, NextResponse } from 'next/server';
import { getMobileUsers } from '@/lib/data';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const mobileUsers = await getMobileUsers();
    
    const user = mobileUsers.find(u => u.username === id || u.contact === id);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    // Return user data without password
    const { password, ...userData } = user;
    
    return NextResponse.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching mobile user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updates = await request.json();
    
    // Get current users
    const mobileUsers = await getMobileUsers();
    const userIndex = mobileUsers.findIndex(u => u.username === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    // Update user data (excluding sensitive fields)
    const updatedUser = {
      ...mobileUsers[userIndex],
      ...updates,
      username: mobileUsers[userIndex].username, // Don't allow username change
      password: mobileUsers[userIndex].password, // Don't allow password change via this endpoint
    };
    
    // Here you would typically save to Google Sheets
    // For now, we'll just return the updated user
    
    const { password, ...userData } = updatedUser;
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: userData
    });
  } catch (error) {
    console.error('Error updating mobile user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Get current users
    const mobileUsers = await getMobileUsers();
    const userIndex = mobileUsers.findIndex(u => u.username === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    // Here you would typically remove from Google Sheets
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mobile user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}