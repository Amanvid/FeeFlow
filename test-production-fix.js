require('dotenv').config({ path: '.env.local' });

const { generateOtp } = require('./src/lib/actions.ts');

async function testProductionFix() {
  console.log('Testing production fix for FROG API...');
  console.log('Environment variables loaded:');
  console.log('- FROG_API_KEY:', process.env.FROG_API_KEY ? 'Present' : 'Missing');
  console.log('- FROG_USERNAME:', process.env.FROG_USERNAME ? 'Present' : 'Missing');
  
  try {
    // Test OTP generation
    const testPhone = '233241234567';
    console.log(`\nTesting OTP generation for ${testPhone}...`);
    
    const result = await generateOtp(testPhone);
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ Production fix successful! OTP generation is working.');
    } else {
      console.log('❌ Production fix failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testProductionFix();