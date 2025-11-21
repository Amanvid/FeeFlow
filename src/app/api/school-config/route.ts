import { NextRequest, NextResponse } from 'next/server';
import { getSchoolConfig } from '@/lib/data';
import { googleSheetsService } from '@/lib/google-sheets';
import { 
  saveDueDateToServer, 
  saveNotificationsToServer, 
  getDueDateFromServer, 
  getNotificationsFromServer,
  isServerDataRecent
} from '@/lib/server-storage';

// GET: Fetch current school configuration
export async function GET(request: NextRequest) {
  try {
    const config = await getSchoolConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching school config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school configuration' },
      { status: 500 }
    );
  }
}

// POST: Update school configuration (notifications and due date)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notifications, dueDate } = body;

    if (!notifications && !dueDate) {
      return NextResponse.json(
        { error: 'Either notifications or dueDate is required' },
        { status: 400 }
      );
    }

    // Track Google Sheets success status
    let googleSheetsSuccess = false;

    // Handle notifications update
    if (notifications) {
      // Validate notification settings
      const requiredKeys: (keyof typeof notifications)[] = [
        'smsEnabled',
        'feeRemindersEnabled', 
        'paymentNotificationsEnabled',
        'admissionNotificationsEnabled'
      ];

      for (const key of requiredKeys) {
        if (typeof notifications[key] !== 'boolean') {
          return NextResponse.json(
            { error: `Invalid notification setting: ${String(key)} must be a boolean` },
            { status: 400 }
          );
        }
      }

      // Try to save to Google Sheets first
      let googleSheetsSuccess = false;
      let googleSheetsError = '';
      
      try {
        const result = await googleSheetsService.saveNotificationSettings(notifications);
        if (result.success) {
          googleSheetsSuccess = true;
          console.log('Notification settings saved to Google Sheets:', notifications);
        } else {
          googleSheetsError = result.message;
          console.warn('Google Sheets save failed:', result.message);
        }
      } catch (error) {
        googleSheetsError = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error saving notification settings to Google Sheets:', error);
      }

      // Always save to server storage as backup
      const localResult = saveNotificationsToServer(notifications);
      
      if (!googleSheetsSuccess && !localResult.success) {
        return NextResponse.json(
          { error: 'Failed to save settings to Google Sheets and local storage', details: googleSheetsError },
          { status: 500 }
        );
      }

      console.log('Notification settings saved successfully:', notifications);
    }

    // Handle due date update
    if (dueDate) {
      // Validate due date format (should be a string like "24 Nov. 2025")
      if (typeof dueDate !== 'string' || dueDate.trim().length === 0) {
        return NextResponse.json(
          { error: 'Invalid due date format' },
          { status: 400 }
        );
      }

      // Try to save to Google Sheets first
      let googleSheetsSuccess = false;
      let googleSheetsError = '';
      const trimmedDueDate = dueDate.trim();
      
      try {
        const result = await googleSheetsService.saveDueDate(trimmedDueDate);
        if (result.success) {
          googleSheetsSuccess = true;
          console.log('Due date saved to Google Sheets:', trimmedDueDate);
        } else {
          googleSheetsError = result.message;
          console.warn('Google Sheets save failed:', result.message);
        }
      } catch (error) {
        googleSheetsError = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error saving due date to Google Sheets:', error);
      }

      // Always save to server storage as backup
      const localResult = saveDueDateToServer(trimmedDueDate);
      
      if (!googleSheetsSuccess && !localResult.success) {
        return NextResponse.json(
          { error: 'Failed to save due date to Google Sheets and local storage', details: googleSheetsError },
          { status: 500 }
        );
      }

      console.log('Due date saved successfully:', trimmedDueDate);
    }
    
    // Return the updated configuration
    const currentConfig = await getSchoolConfig();
    
    // Check if we have server storage data and Google Sheets failed
    const hasServerDueDate = getDueDateFromServer();
    const hasServerNotifications = getNotificationsFromServer();
    const hasRecentServerData = isServerDataRecent();
    
    let message = 'Settings updated successfully';
    if (hasRecentServerData && (!googleSheetsSuccess || (notifications && !googleSheetsSuccess))) {
      message += ' (saved locally - will sync when connection is restored)';
    } else if (googleSheetsSuccess) {
      message += ' and saved to Google Sheets';
    }
    
    return NextResponse.json({
      ...currentConfig,
      notifications: notifications || currentConfig.notifications,
      dueDate: dueDate || currentConfig.dueDate,
      message: message,
      syncedToGoogleSheets: googleSheetsSuccess
    });
  } catch (error) {
    console.error('Error updating school config:', error);
    return NextResponse.json(
      { error: 'Failed to update school configuration' },
      { status: 500 }
    );
  }
}