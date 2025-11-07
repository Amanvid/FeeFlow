// Test to find the correct sender ID
require('dotenv').config();

const API_KEY = process.env.FROG_API_KEY;
const USERNAME = process.env.FROG_USERNAME;

console.log('Environment Variables:');
console.log('FROG_API_KEY:', API_KEY ? 'Set' : 'Missing');
console.log('FROG_USERNAME:', USERNAME ? 'Set' : 'Missing');

if (!API_KEY || !USERNAME) {
  console.error('❌ Missing SMS API credentials in environment variables');
  process.exit(1);
}

// Test with different sender IDs that might be authorized
const senderIds = ['INFO', 'FLOWSMS', 'FEEFLOW', 'amanvid', 'WIGAL', 'TEST', 'SMS'];

async function testSenderId(senderId) {
  const testPhone = '233241234567';
  const testMessage = 'Test message from FeeFlow';
  
  console.log(`\n🧪 Testing SMS with Sender ID: ${senderId}`);
  
  try {
    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': API_KEY,
        'USERNAME': USERNAME,
      },
      body: JSON.stringify({
        senderid: senderId,
        destinations: [{
          destination: testPhone,
          message: testMessage,
          msgid: `test-${Date.now()}`,
          smstype: 'text'
        }]
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.status === 'ACCEPTD') {
      console.log('✅ SMS accepted for processing');
      return true;
    } else {
      console.log('❌ SMS failed:', data.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testAllSenderIds() {
  for (const senderId of senderIds) {
    const success = await testSenderId(senderId);
    if (success) {
      console.log(`\n🎉 Found working sender ID: ${senderId}`);
      break;
    }
  }
}

testAllSenderIds();