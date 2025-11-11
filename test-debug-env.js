// Test debug environment endpoint
async function testDebugEnv() {
  try {
    console.log('Testing debug environment endpoint...');
    
    const response = await fetch('https://fee-flow-89h0m4ili-ghub-it-centers-projects.vercel.app/api/debug/env');
    const data = await response.json();
    
    console.log('Environment variables:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDebugEnv();