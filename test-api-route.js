// Test if API routes exist
async function testAPIRoutes() {
  const baseUrl = 'https://fee-flow-dxoo58xnb-ghub-it-centers-projects.vercel.app';
  
  const endpoints = [
    '/api/auth/send-otp',
    '/api/auth/mobile/register',
    '/api/auth/login'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint}...`);
      
      // Test GET request first
      const getResponse = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log(`GET ${endpoint} - Status: ${getResponse.status}`);
      
      // Test POST request
      const postResponse = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
        redirect: 'manual'
      });
      
      console.log(`POST ${endpoint} - Status: ${postResponse.status}`);
      
      if (postResponse.status >= 300 && postResponse.status < 400) {
        console.log(`Redirected to: ${postResponse.headers.get('location')}`);
      }
      
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error.message);
    }
  }
}

testAPIRoutes();