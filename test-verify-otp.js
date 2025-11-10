const https = require('https');

async function testVerifyOtp() {
  const postData = JSON.stringify({
    phone: 'test@example.com',
    otp: '131700',
    username: 'SuperAdmin'
  });

  const options = {
    hostname: 'fee-flow-five.vercel.app',
    port: 443,
    path: '/api/auth/verify-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Testing verify-otp endpoint...');
  console.log('Request data:', postData);

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('Response Body:', data);
      
      try {
        const response = JSON.parse(data);
        console.log('Parsed Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });

  req.write(postData);
  req.end();
}

// Wait a bit for any previous requests to complete
setTimeout(testVerifyOtp, 2000);