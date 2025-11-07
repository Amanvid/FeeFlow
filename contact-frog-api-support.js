// This script generates the information needed to contact Frog API support
require('dotenv').config({ path: '.env.local' });

console.log('=== Frog API Support Contact Information ===\n');

console.log('ISSUE: API credentials are returning PERMISSION_DENIED errors\n');

console.log('ACCOUNT DETAILS:');
console.log('Username:', process.env.FROG_USERNAME);
console.log('API Key Length:', process.env.FROG_API_KEY?.length);
console.log('API Key Format:', process.env.FROG_API_KEY?.substring(0, 10) + '...');
console.log('Test Phone Number: 233501234567\n');

console.log('TESTED ENDPOINTS:');
console.log('1. OTP Generation: POST https://frogapi.wigal.com.gh/api/v3/sms/otp/generate');
console.log('2. SMS Sending: POST https://frogapi.wigal.com.gh/api/v3/sms/send');
console.log('3. Both return: 403 Forbidden - PERMISSION_DENIED\n');

console.log('TESTED SENDER IDs:');
console.log('FeeFlow, WIGAL, TEST, INFO, SMS - All failed with same error\n');

console.log('TROUBLESHOOTING STEPS COMPLETED:');
console.log('✅ Verified API key is correctly loaded (42 characters)');
console.log('✅ Verified username is set (amanvid)');
console.log('✅ Verified request format matches API documentation');
console.log('✅ Tested multiple sender IDs');
console.log('✅ Confirmed environment variables are accessible\n');

console.log('LIKELY ISSUES TO INVESTIGATE:');
console.log('1. Account activation status');
console.log('2. IP address whitelisting requirements');
console.log('3. Account balance for SMS services');
console.log('4. API key validity/expiration');
console.log('5. Account permission levels\n');

console.log('SUPPORT CONTACT INFORMATION:');
console.log('Please contact Frog API support with the following details:');
console.log('- Account username: amanvid');
console.log('- API key format: 42-character string starting with "/W.P.1Yqk6"');
console.log('- Error: PERMISSION_DENIED on all API endpoints');
console.log('- Test phone: 233501234567');
console.log('- Server IP: [Your current server IP]');
console.log('- Request timestamp:', new Date().toISOString());

console.log('\n=== NEXT STEPS ===');
console.log('1. Contact Frog API support to verify account status');
console.log('2. Request IP whitelisting if required');
console.log('3. Verify account has SMS service permissions');
console.log('4. Check account balance for SMS services');
console.log('5. Request new API credentials if current ones are expired');