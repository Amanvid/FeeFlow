import { NextRequest, NextResponse } from 'next/server';
import { getSchoolConfig } from '@/lib/data';
import { googleSheetsService } from '@/lib/google-sheets';

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

// POST: Update school configuration (notifications only for now)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notifications } = body;

    if (!notifications) {
      return NextResponse.json(
        { error: 'Notifications configuration is required' },
        { status: 400 }
      );
    }

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

    // Save to Google Sheets
    const result = await googleSheetsService.saveNotificationSettings(notifications);
    
    if (!result.success) {
      console.error('Failed to save notification settings to Google Sheets:', result.message);
      return NextResponse.json(
        { error: 'Failed to save settings to Google Sheets', details: result.message },
        { status: 500 }
      );
    }

    console.log('Notification settings saved to Google Sheets:', notifications);
    
    // Return the updated configuration
    const currentConfig = await getSchoolConfig();
    return NextResponse.json({
      ...currentConfig,
      notifications,
      message: 'Settings updated successfully and saved to Google Sheets.'
    });
  } catch (error) {
    console.error('Error updating school config:', error);
    return NextResponse.json(
      { error: 'Failed to update school configuration' },
      { status: 500 }
    );
  }
}