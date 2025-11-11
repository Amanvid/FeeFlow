// Test OTP functionality on deployed app with better error handling
async function testOTP() {
  const testPhone = "0536282694"; // Same number from the logs
  
  try {
    console.log(`Testing OTP send for phone: ${testPhone}`);
    
    const response = await fetch('https://fee-flow-dxoo58xnb-ghub-it-centers-projects.vercel.app/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: testPhone }),
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response text:`, responseText);
    
    // Try to parse as JSON if possible
    try {
      const data = JSON.parse(responseText);
      console.log(`Parsed response:`, data);
      
      if (response.ok && data.success) {
        console.log('✅ OTP sent successfully!');
      } else {
        console.log('❌ Failed to send OTP:', data.error);
      }
    } catch (parseError) {
      console.log('Response is not JSON, might be HTML error page');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testOTP();