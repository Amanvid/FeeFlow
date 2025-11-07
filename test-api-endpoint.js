// Test the API endpoint directly
async function testOtpEndpoint() {
  try {
    const response = await fetch('http://localhost:9002/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: '233501234567' }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testOtpEndpoint();