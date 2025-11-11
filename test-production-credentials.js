require('dotenv').config({ path: '.env.local' });

async function testProductionCredentials() {
  console.log('=== Testing Production FROG API Credentials ===');
  
  // Get credentials from environment
  const apiKey = process.env.FROG_API_KEY;
  const username = process.env.FROG_USERNAME;
  
  console.log('API Key:', apiKey ? 'Set' : 'Not set');
  console.log('Username:', username || 'Not set');
  
  if (!apiKey || !username) {
    console.error('❌ Missing credentials');
    return;
  }
  
  console.log('API Key length:', apiKey.length);
  console.log('API Key starts with:', apiKey.substring(0, 10));
  console.log('API Key ends with:', apiKey.substring(apiKey.length - 10));
  
  // Clean the API key
  const cleanApiKey = apiKey.replace(/^["']|["']$/g, '').replace(/\\/g, '');
  console.log('Clean API Key length:', cleanApiKey.length);
  console.log('Clean API Key starts with:', cleanApiKey.substring(0, 10));
  
  // Test the API
  const requestBody = {
    number: '233501234567',
    expiry: 5,
    length: 6,
    messagetemplate: 'Your FeeFlow verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.',
    type: 'NUMERIC',
    senderid: 'FeeFlow'
  };
  
  console.log('\n=== Making API Call ===');
  
  try {
    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/sms/otp/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': cleanApiKey,
        'USERNAME': username
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.status === 'SUCCESS') {
      console.log('✅ Production credentials are working!');
    } else {
      console.log('❌ Production credentials failed:', data.message);
    }
  } catch (error) {
    console.error('❌ API call failed:', error.message);
  }
}

testProductionCredentials();