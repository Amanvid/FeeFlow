const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

console.log('=== Testing Different Sender IDs ===');
console.log('API Key:', apiKey ? 'Set' : 'Not set');
console.log('Username:', username || 'Not set');

if (!apiKey || !username) {
  console.error('Missing API credentials');
  process.exit(1);
}

// Test different sender IDs that might be allowed
const senderIds = ['Stevkky', 'amanvid', 'Wigal', 'FROG', 'INFO'];

async function testSenderId(senderId) {
  console.log(`\n=== Testing Sender ID: ${senderId} ===`);
  
  const postData = {
    number: "233501234567",
    expiry: 1,
    length: 5,
    messagetemplate: "Hello, your OTP is : %OTPCODE%. It will expire after %EXPIRY% mins",
    type: "ALPHANUMERIC",
    senderid: senderId
  };

  try {
    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/sms/otp/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey,
        'USERNAME': username
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data)}`);
    
    return { senderId, status: response.status, data };
  } catch (error) {
    console.error(`Error with ${senderId}:`, error.message);
    return { senderId, status: 'error', error: error.message };
  }
}

// Test all sender IDs
async function runTests() {
  const results = [];
  
  for (const senderId of senderIds) {
    const result = await testSenderId(senderId);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== Summary ===');
  results.forEach(result => {
    console.log(`${result.senderId}: ${result.status}`);
    if (result.data && result.data.message) {
      console.log(`  Message: ${result.data.message}`);
    }
  });
}

runTests();