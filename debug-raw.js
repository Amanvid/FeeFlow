// Test script to check raw Teachers sheet data
const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testRawData() {
  try {
    // Get raw Teachers sheet data
    const rawData = await makeRequest({
      hostname: 'localhost',
      port: 9002,
      path: '/api/debug/sheet-info',
      method: 'GET'
    });

    console.log('Raw Teachers sheet data:');
    console.log(JSON.stringify(rawData, null, 2));
    
    // Look specifically for Rosemond's adminPrivileges
    if (rawData.found) {
      const rosemond = rawData.found.find(row => row.name && row.name.includes('Rosemond'));
      if (rosemond) {
        console.log('\nRosemond data:', rosemond);
        console.log('Admin Privileges:', rosemond.adminPrivileges);
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testRawData();