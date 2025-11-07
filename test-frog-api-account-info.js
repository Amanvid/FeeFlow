const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

console.log('=== Testing Account Info Endpoint ===');
console.log('API Key:', apiKey ? 'Set' : 'Not set');
console.log('Username:', username || 'Not set');

if (!apiKey || !username) {
  console.error('Missing API credentials');
  process.exit(1);
}

// Test account info endpoint
async function testAccountInfo() {
  console.log('\n=== Testing Account Info ===');
  
  try {
    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/account/info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey,
        'USERNAME': username
      }
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
    
    return { status: response.status, data };
  } catch (error) {
    console.error('Error:', error.message);
    return { status: 'error', error: error.message };
  }
}

// Test with different phone number formats
async function testPhoneFormats() {
  const phoneFormats = [
    '233501234567',    // Current format
    '0501234567',      // Local format
    '23350123456',     // One digit less
    '2335012345678',   // One digit more
    '+233501234567',   // With plus
  ];
  
  console.log('\n=== Testing Different Phone Formats ===');
  
  for (const phoneNumber of phoneFormats) {
    console.log(`\n--- Testing: ${phoneNumber} ---`);
    
    const postData = {
      number: phoneNumber,
      expiry: 1,
      length: 5,
      messagetemplate: "Hello, your OTP is : %OTPCODE%. It will expire after %EXPIRY% mins",
      type: "ALPHANUMERIC",
      senderid: "Stevkky"
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
      if (data.message) {
        console.log(`Message: ${data.message}`);
      }
      
    } catch (error) {
      console.error(`Error:`, error.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function runTests() {
  await testAccountInfo();
  await testPhoneFormats();
}

runTests();