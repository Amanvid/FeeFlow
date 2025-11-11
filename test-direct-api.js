require('dotenv').config({ path: '.env.local' });

async function testDirectApiCall() {
  console.log('Testing direct API call with production fix...');
  console.log('Environment variables loaded:');
  console.log('- FROG_API_KEY:', process.env.FROG_API_KEY ? 'Present' : 'Missing');
  console.log('- FROG_USERNAME:', process.env.FROG_USERNAME ? 'Present' : 'Missing');
  
  try {
    // Clean the API key like the fixed code does
    const rawApiKey = process.env.FROG_API_KEY;
    const username = process.env.FROG_USERNAME;
    const apiKey = rawApiKey?.replace(/^["']|["']$/g, '').replace(/\\/g, '');
    
    console.log(`API_KEY available: ${!!apiKey}, length: ${apiKey?.length}`);
    console.log(`USERNAME available: ${!!username}`);
    
    if (!apiKey || !username) {
      console.log('❌ Missing credentials - this is expected in test environment');
      return;
    }
    
    // Test direct API call to FROG API
    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/sms/otp/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey,
        'USERNAME': username,
      },
      body: JSON.stringify({
        number: '233241234567',
        expiry: 5,
        length: 6,
        messagetemplate: 'Your FeeFlow verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.',
        type: 'NUMERIC',
        senderid: 'FeeFlow',
      }),
    });
    
    const data = await response.json();
    console.log('Direct API Response:');
    console.log('Status:', response.status);
    console.log('Data:', data);
    
    if (response.ok && data.status === 'SUCCESS') {
      console.log('✅ Direct API call successful! The fix should work in production.');
    } else {
      console.log('❌ Direct API call failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error during direct API test:', error);
  }
}

testDirectApiCall();