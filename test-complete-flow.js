// Test script to verify the complete OTP flow
const https = require('https');

function makeRequest(hostname, path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`Making ${method} request to ${hostname}${path}`);
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
          resolve({ statusCode: res.statusCode, headers: res.headers, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testCompleteFlow() {
  try {
    console.log('=== Testing Complete OTP Flow ===\n');
    
    // Step 1: Send OTP
    console.log('Step 1: Sending OTP to test email...');
    const sendOtpResponse = await makeRequest(
      'fee-flow-five.vercel.app',
      '/api/auth/send-otp',
      'POST',
      {
        phone: 'test@example.com',
        username: 'SuperAdmin'
      }
    );
    
    console.log('Send OTP Result:', JSON.stringify(sendOtpResponse, null, 2));
    
    if (sendOtpResponse.data.success) {
      console.log('✅ OTP sent successfully');
      
      // Extract OTP from response (in development mode)
      const otpMatch = sendOtpResponse.data.message?.match(/Code: (\d{6})/);
      const otp = otpMatch ? otpMatch[1] : '131700'; // Fallback to known code
      
      console.log(`Using OTP: ${otp}`);
      
      // Wait a moment before verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Verify OTP
      console.log('\nStep 2: Verifying OTP...');
      const verifyResponse = await makeRequest(
        'fee-flow-five.vercel.app',
        '/api/auth/verify-otp',
        'POST',
        {
          phone: 'test@example.com',
          otp: otp,
          username: 'SuperAdmin'
        }
      );
      
      console.log('Verify OTP Result:', JSON.stringify(verifyResponse, null, 2));
      
      if (verifyResponse.data.success) {
        console.log('✅ OTP verification successful!');
        console.log('Expected response format for mobile app:');
        console.log(JSON.stringify(verifyResponse.data, null, 2));
      } else {
        console.log('❌ OTP verification failed:', verifyResponse.data.message);
      }
    } else {
      console.log('❌ Failed to send OTP:', sendOtpResponse.data.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCompleteFlow();