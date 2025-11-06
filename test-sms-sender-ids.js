// Test SMS with proper environment variable loading
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

// Test with different sender IDs
const senderIds = ['FLOWSMS', 'INFO', 'amanvid', 'FEEFLOW'];

async function testSmsWithDifferentSenderIds() {
  const testPhone = '233241234567';
  const testMessage = 'Test message from FeeFlow';
  
  for (const senderId of senderIds) {
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
      console.log(`Response for ${senderId}:`, data);
      
      if (data.status === 'ACCEPTD') {
        console.log(`✅ SMS accepted with sender ID: ${senderId}`);
        return; // Success, stop testing
      } else {
        console.log(`❌ SMS failed with sender ID ${senderId}:`, data.message);
      }
      
    } catch (error) {
      console.error(`❌ Error with sender ID ${senderId}:`, error.message);
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testSmsWithDifferentSenderIds();