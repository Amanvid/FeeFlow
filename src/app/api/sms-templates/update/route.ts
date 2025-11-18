import { NextRequest, NextResponse } from 'next/server';
import { getSmsTemplatesFromSheet, clearSmsTemplatesCache } from '@/lib/data';

// API endpoint to manually trigger SMS template updates
// This can be called by a cron job or manually via admin panel
export async function POST(request: NextRequest) {
  try {
    const { force = false } = await request.json();
    
    console.log(`[SMS Templates Update] Starting template update. Force: ${force}`);
    const startTime = Date.now();
    
    // Clear cache if force update is requested
    if (force) {
      console.log('[SMS Templates Update] Force update requested - clearing cache');
      await clearSmsTemplatesCache();
    }
    
    // Fetch fresh templates from Google Sheets
    console.log('[SMS Templates Update] Fetching templates from Google Sheets...');
    const templates = await getSmsTemplatesFromSheet();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[SMS Templates Update] Template update completed in ${duration}ms`);
    console.log(`[SMS Templates Update] Templates fetched:`, {
      feeReminder: templates.feeReminderTemplate?.substring(0, 50) + '...',
      adminActivation: templates.adminActivationTemplate?.substring(0, 50) + '...',
      otp: templates.otpTemplate?.substring(0, 50) + '...',
      activation: templates.activationTemplate?.substring(0, 50) + '...',
      paymentNotification: templates.paymentNotificationTemplate?.substring(0, 50) + '...',
      admissionNotification: templates.admissionNotificationTemplate?.substring(0, 50) + '...'
    });
    
    return NextResponse.json({
      success: true,
      message: 'SMS templates updated successfully',
      timestamp: new Date().toISOString(),
      duration: duration,
      templates: {
        count: Object.keys(templates).length,
        types: Object.keys(templates)
      }
    });
    
  } catch (error) {
    console.error('[SMS Templates Update] Error updating templates:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update SMS templates',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check current template status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('content') === 'true';
    
    console.log('[SMS Templates Status] Checking template status');
    
    // Get fresh templates (this will use cache if available)
    const templates = await getSmsTemplatesFromSheet();
    
    const response: any = {
      success: true,
      timestamp: new Date().toISOString(),
      templates: {
        count: Object.keys(templates).length,
        types: Object.keys(templates)
      }
    };
    
    if (includeContent) {
      response.templates.content = {
        feeReminder: templates.feeReminderTemplate,
        adminActivation: templates.adminActivationTemplate,
        otp: templates.otpTemplate,
        activation: templates.activationTemplate,
        paymentNotification: templates.paymentNotificationTemplate,
        admissionNotification: templates.admissionNotificationTemplate
      };
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[SMS Templates Status] Error checking template status:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check SMS template status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}