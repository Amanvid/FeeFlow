// Direct test script to verify SMS functionality with Wigal API
// This script tests the SMS API directly without importing TypeScript modules

const API_KEY = "$2y$10$6oYYcjc6Ge3/W.P.1Yqk6eHBs0ERVFR6IaBQ2qpYGBnMYp28B3uPe";
const USERNAME = "amanvid";
const FROG_API_BASE_URL = "https://frogapi.wigal.com.gh/api/v3";

// Mock school config for testing
const mockSchoolConfig = {
  schoolName: 'Chariot Educational Complex',
  senderId: 'CHARIOT EDU',
  notifications: {
    smsEnabled: true,
    feeRemindersEnabled: true
  },
  dueDate: '2024-12-31'
};

// Mock student data for testing
const testStudent = {
  id: 'test-123',
  studentName: 'Test Student',
  guardianName: 'Test Guardian',
  guardianPhone: '0241234567', // Test phone number with proper Ghana format
  balance: 500.00
};

async function sendSmsDirect(destinations, senderId) {
  try {
    console.log('Sending SMS with payload:', JSON.stringify({
      senderid: senderId,
      destinations: destinations
    }, null, 2));
    
    const response = await fetch(`${FROG_API_BASE_URL}/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
        "USERNAME": USERNAME,
      },
      body: JSON.stringify({
        senderid: senderId,
        destinations: destinations.map(d => ({ 
          destination: d.destination,
          message: d.message,
          msgid: d.msgid,
          smstype: d.smstype || "text"
        })),
      }),
    });
    
    const data = await response.json();
    console.log('SMS API Response:', data);
    
    if (data.status === 'ACCEPTD') {
      console.log("✅ SMS accepted for processing:", data.message);
      return { success: true };
    }
    console.error("❌ Failed to send SMS:", data);
    return { success: false, error: data.message || 'Failed to send SMS' };
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

async function sendFeeReminderSmsDirect(student, customSenderId = null) {
  try {
    console.log('Starting fee reminder SMS process...');
    console.log('Student data:', student);
    console.log('Custom Sender ID:', customSenderId);
    
    // Check if SMS notifications are enabled
    if (!mockSchoolConfig.notifications?.smsEnabled) {
      return { success: false, message: "SMS notifications are disabled." };
    }

    // Check if fee reminders are enabled
    if (!mockSchoolConfig.notifications?.feeRemindersEnabled) {
      return { success: false, message: "Fee reminders are disabled." };
    }

    if (!student.guardianPhone) {
      return { success: false, message: "Guardian phone number is missing." };
    }
    if (student.balance <= 0) {
      return { success: false, message: "Student has no outstanding balance." };
    }

    const guardianName = student.guardianName || 'Guardian';
    
    const message = `Dear ${guardianName}, a friendly reminder from ${mockSchoolConfig.schoolName} that the outstanding fee balance for ${student.studentName} is GHS ${student.balance.toFixed(2)}. Payment is due by ${mockSchoolConfig.dueDate}. Thank you.`;

    console.log('Generated message:', message);
    
    const senderId = customSenderId || mockSchoolConfig.senderId;
    console.log('Using sender ID:', senderId);

    const result = await sendSmsDirect(
      [{
        destination: student.guardianPhone,
        message: message,
        msgid: `reminder-${student.id}-${Math.random().toString(36).slice(2, 6)}`,
      }],
      senderId
    );

    if (result.success) {
      return { success: true, message: `Reminder sent to ${student.guardianName} (${student.guardianPhone}).` };
    } else {
      return { success: false, message: result.error || "Failed to send reminder SMS." };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("❌ Error in sendFeeReminderSms:", error);
    return { success: false, message: errorMessage };
  }
}

async function testSmsFunctionality() {
  console.log('🧪 Testing SMS functionality with multiple phone formats and sender IDs...\n');
  
  const phoneNumbers = [
    '0241234567',
    '0536282694',
    '+233241234567',
    '233241234567',
    '233536282694'
  ];
  
  const senderIds = [
    'CHARIOT EDU',  // Current sender ID
    'WIGAL',        // Try Wigal's default sender ID
    'INFO',         // Try generic INFO sender
    '23324'         // Try a short code
  ];
  
  for (let senderId of senderIds) {
    console.log(`\n📡 Testing with Sender ID: ${senderId}`);
    console.log('='.repeat(50));
    
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phone = phoneNumbers[i];
      console.log(`📱 Testing with phone: ${phone}`);
      
      try {
        const result = await sendFeeReminderSmsDirect({...testStudent, guardianPhone: phone}, senderId);
        console.log(`✅ ${result.message}\n`);
      } catch (error) {
        console.error(`❌ Error with ${phone}:`, error.message);
      }
      
      // Add delay between tests to avoid rate limiting
      if (i < phoneNumbers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log('\n🎯 All tests completed!');
}

// Run the test
testSmsFunctionality();