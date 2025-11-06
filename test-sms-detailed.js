// Test SMS with detailed error logging
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

async function testSmsWithDetailedLogging() {
  const testPhone = '233241234567';
  const testMessage = 'Test message from FeeFlow';
  const senderId = 'amanvid'; // Use the username
  
  console.log(`\n🧪 Testing SMS with detailed logging`);
  console.log(`📱 Phone: ${testPhone}`);
  console.log(`📨 Sender ID: ${senderId}`);
  console.log(`💬 Message: ${testMessage}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`👤 Username: ${USERNAME}`);
  
  try {
    const requestBody = JSON.stringify({
      senderid: senderId,
      destinations: [{
        destination: testPhone,
        message: testMessage,
        msgid: `test-${Date.now()}`,
        smstype: 'text'
      }]
    });
    
    console.log(`📤 Request Body: ${requestBody}`);
    
    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': API_KEY,
        'USERNAME': USERNAME,
      },
      body: requestBody
    });
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📥 Response Text: ${responseText}`);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`📥 Response JSON:`, data);
    } catch (e) {
      console.log(`❌ Failed to parse response as JSON:`, e.message);
      console.log(`📄 Raw response:`, responseText);
      return;
    }
    
    if (data.status === 'ACCEPTD') {
      console.log('✅ SMS accepted for processing');
    } else {
      console.log('❌ SMS failed:', data.message);
      
      // Check if there's more error information
      if (data.errors) {
        console.log('📋 Errors:', data.errors);
      }
      if (data.details) {
        console.log('📋 Details:', data.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Error Stack:', error.stack);
  }
}

testSmsWithDetailedLogging();