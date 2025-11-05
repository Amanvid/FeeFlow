// Test script to verify SMS functionality with Wigal API
const { sendFeeReminderSms } = require('./src/lib/actions.ts');

// Mock student data for testing
const testStudent = {
  id: 'test-123',
  studentName: 'Test Student',
  guardianName: 'Test Guardian',
  guardianPhone: '0536282694', // Test phone number
  balance: 500.00
};

async function testSmsFunctionality() {
  console.log('Testing SMS functionality with Wigal API...');
  console.log('Test student data:', testStudent);
  
  try {
    const result = await sendFeeReminderSms(testStudent);
    console.log('SMS Test Result:', result);
    
    if (result.success) {
      console.log('✅ SMS sent successfully!');
      console.log('Message:', result.message);
    } else {
      console.log('❌ SMS failed to send');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Unexpected error during SMS test:', error);
  }
}

// Run the test
testSmsFunctionality();