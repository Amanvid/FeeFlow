// Test SMS with FeeFlow sender ID
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

async function testSmsWithFeeFlow() {
  const testPhone = '233241234567';
  const testMessage = 'Test message from FeeFlow';
  const senderId = 'FeeFlow'; // Use approved sender ID
  
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
    } else {
      console.log('❌ SMS failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSmsWithFeeFlow();