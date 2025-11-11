// Test script to verify production-ready FROG API integration
const https = require('https');

// Test with production environment variables
const API_KEY = process.env.FROG_API_KEY;
const USERNAME = process.env.FROG_USERNAME;
const SENDER_ID = "FeeFlow";

console.log('Testing FROG API Production Integration...');
console.log('API Key length:', API_KEY?.length || 0);
console.log('Username:', USERNAME);
console.log('Sender ID:', SENDER_ID);

if (!API_KEY || !USERNAME) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Clean API key
const cleanApiKey = API_KEY.replace(/^["']|["']$/g, '').replace(/\\/g, '');

// Test API credentials
const testCredentials = async () => {
  const options = {
    hostname: 'frog.wigroup.net',
    port: 443,
    path: '/api/v1/GetSenderIds',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanApiKey}`,
      'User-Agent': USERNAME
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// Test SMS sending
const testSmsSend = async () => {
  const postData = JSON.stringify({
    "senderId": SENDER_ID,
    "message": "Test message from production environment",
    "phone": "233241234567",
    "apiKey": cleanApiKey,
    "username": USERNAME
  });

  const options = {
    hostname: 'frog.wigroup.net',
    port: 443,
    path: '/api/v1/SendSms',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Run tests
async function runTests() {
  try {
    console.log('\n1. Testing API credentials...');
    const credResult = await testCredentials();
    console.log('Credentials test:', credResult.status, credResult.data);

    if (credResult.status === 200) {
      console.log('✅ API credentials are valid');
      
      console.log('\n2. Testing SMS sending...');
      const smsResult = await testSmsSend();
      console.log('SMS test:', smsResult.status, smsResult.data);
      
      if (smsResult.status === 200) {
        console.log('✅ SMS sending is working');
      } else {
        console.log('❌ SMS sending failed');
      }
    } else {
      console.log('❌ API credentials test failed');
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

runTests();