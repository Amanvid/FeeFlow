// Debug script to check raw teachers data
const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: result });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function debugTeachersData() {
  try {
    // Get debug teachers data
    const response = await makeRequest({
      hostname: 'localhost',
      port: 9002,
      path: '/api/debug/teachers',
      method: 'GET'
    });

    console.log('Debug teachers data:', JSON.stringify(response.body, null, 2));
    
    // Get test teachers data
    const testResponse = await makeRequest({
      hostname: 'localhost',
      port: 9002,
      path: '/api/test-teachers',
      method: 'GET'
    });

    console.log('\nTest teachers data:', JSON.stringify(testResponse.body, null, 2));
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugTeachersData();