require('dotenv').config({ path: '.env.local' });

async function testProductionEndpoint() {
  console.log('Testing production endpoint fix...');
  console.log('Environment variables loaded:');
  console.log('- FROG_API_KEY:', process.env.FROG_API_KEY ? 'Present' : 'Missing');
  console.log('- FROG_USERNAME:', process.env.FROG_USERNAME ? 'Present' : 'Missing');
  
  try {
    // Test the actual production endpoint
    const response = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '233241234567'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Production endpoint test successful!');
    } else {
      console.log('❌ Production endpoint test failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// First start the development server
console.log('Starting development server...');
const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'dev'], { stdio: 'pipe' });

server.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Ready') || output.includes('3000')) {
    console.log('Server is ready, running test...');
    setTimeout(testProductionEndpoint, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});