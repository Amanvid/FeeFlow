const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const apiKey = process.env.FROG_API_KEY;
const username = process.env.FROG_USERNAME;

console.log('=== Frog API Support Request Information ===');
console.log('Date:', new Date().toISOString());
console.log('Username:', username);
console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'Not set');
console.log('API Key Length:', apiKey ? apiKey.length : 0);

// Get current IP address
const https = require('https');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const ipInfo = JSON.parse(data);
      console.log('Current IP Address:', ipInfo.ip);
      
      console.log('\n=== Support Request Template ===');
      console.log(`
Dear Frog API Support,

We are experiencing authorization issues with our Frog API account. Please find the details below:

Account Information:
- Username: ${username}
- API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'Not set'} (Length: ${apiKey ? apiKey.length : 0})
- Current IP Address: ${ipInfo.ip}
- Date: ${new Date().toISOString()}

Issue Description:
We are receiving "PERMISSION_DENIED" errors when attempting to use the following endpoints:
- POST /api/v3/sms/otp/generate
- POST /api/v3/sms/otp/verify
- GET /api/v3/account/info (returns 404)

Error Details:
- Status Code: 403
- Message: "You are not authorized to perform action requested on resource"
- This occurs with all tested sender IDs and phone number formats

Request:
Please verify the following for our account:
1. Account activation status
2. SMS service permissions
3. IP whitelisting requirements
4. Account balance/status
5. Required account verification steps

We have verified that:
- API credentials are correctly configured
- Request format matches API documentation
- Multiple sender IDs have been tested
- Multiple phone number formats have been tested

Please let us know what steps are required to resolve this authorization issue.

Best regards,
FeeFlow Development Team
`);
      
    } catch (error) {
      console.error('Error getting IP address:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('Error getting IP address:', error.message);
});