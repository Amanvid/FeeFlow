// Test script to verify SMS templates are being read correctly from Google Sheets
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;

async function testSmsTemplates() {
  console.log('Testing SMS Templates from Google Sheets...\n');
  
  try {
    // Import the function dynamically since it's TypeScript
    const { getSmsTemplatesFromSheet, clearSmsTemplatesCache } = await import('./src/lib/data.ts');
    
    // Clear cache to ensure fresh read
    await clearSmsTemplatesCache();
    console.log('Cache cleared, fetching fresh templates...');
    
    // Fetch templates
    const templates = await getSmsTemplatesFromSheet();
    
    console.log('\n=== SMS Templates Retrieved ===');
    console.log('Fee Reminder Template:', templates.feeReminderTemplate);
    console.log('Admin Activation Template:', templates.adminActivationTemplate);
    console.log('OTP Template:', templates.otpTemplate);
    console.log('Activation Template:', templates.activationTemplate);
    console.log('Payment Notification Template:', templates.paymentNotificationTemplate);
    console.log('Admission Notification Template:', templates.admissionNotificationTemplate);
    
    // Test template placeholder replacement
    console.log('\n=== Testing Template Placeholder Replacement ===');
    
    // Test fee reminder template
    const testStudent = {
      guardianName: 'John Doe',
      studentName: 'Jane Smith',
      balance: 1500.00,
      dueDate: '2024-12-31'
    };
    
    const testSchoolConfig = {
      schoolName: 'Test School'
    };
    
    const feeReminderMessage = templates.feeReminderTemplate
      .replace(/{guardianName}/g, testStudent.guardianName)
      .replace(/{schoolName}/g, testSchoolConfig.schoolName)
      .replace(/{studentName}/g, testStudent.studentName)
      .replace(/{balance}/g, testStudent.balance.toFixed(2))
      .replace(/{dueDate}/g, testStudent.dueDate);
    
    console.log('\nFee Reminder Message:');
    console.log(feeReminderMessage);
    
    // Test admin activation template
    const adminActivationMessage = templates.adminActivationTemplate
      .replace(/{guardianPhone}/g, '0241234567')
      .replace(/{studentName}/g, 'Jane Smith')
      .replace(/{className}/g, 'Grade 10')
      .replace(/{totalAmount}/g, '1500.00')
      .replace(/{otpCode}/g, '12345678')
      .replace(/{expiry}/g, '15');
    
    console.log('\nAdmin Activation Message:');
    console.log(adminActivationMessage);
    
    // Test cache functionality - second call should use cache
    console.log('\n=== Testing Cache Functionality ===');
    const startTime = Date.now();
    const cachedTemplates = await getSmsTemplatesFromSheet();
    const endTime = Date.now();
    
    console.log(`Second fetch took ${endTime - startTime}ms (should be fast due to caching)`);
    console.log('Cache working:', cachedTemplates.feeReminderTemplate === templates.feeReminderTemplate);
    
    console.log('\n✅ SMS Template System Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Error testing SMS templates:', error);
    console.error('Error details:', error.message);
    
    // Try to get more specific error information
    if (error.message.includes('Cannot find module')) {
      console.error('Make sure the TypeScript files are compiled or run with ts-node');
    }
  }
}

// Run the test
testSmsTemplates();