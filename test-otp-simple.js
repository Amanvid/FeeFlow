// Test OTP generation with simple parameters
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

async function testOtpGeneration() {
  const testPhone = '233241234567';
  
  console.log(`\n🧪 Testing OTP generation for: ${testPhone}`);
  console.log(`Using sender ID: ${USERNAME}`);
  
  try {
    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/sms/otp/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': API_KEY,
        'USERNAME': USERNAME,
      },
      body: JSON.stringify({
        number: testPhone,
        expiry: 5,
        length: 6,
        messagetemplate: `Your verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
        type: 'NUMERIC',
        senderid: 'FeeFlow', // Use approved sender ID
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.status === 'SUCCESS') {
      console.log('✅ OTP generation successful');
    } else {
      console.log('❌ OTP generation failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOtpGeneration();