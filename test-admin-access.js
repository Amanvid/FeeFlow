// Test script to check admin class access
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: result });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAdminClassAccess() {
  try {
    // First, let's try to login as Rosemond
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 9002,
      path: '/api/auth/teacher-login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      username: 'Rosemond',
      password: 'Rosemond18'
    });

    console.log('Login result:', loginResponse.body);

    if (loginResponse.body.success) {
      // Now try to access a different class (KG 1) that Rosemond doesn't teach
      const classResponse = await makeRequest({
        hostname: 'localhost',
        port: 9002,
        path: '/api/teacher/students/KG%201',
        method: 'GET',
        headers: {
          'Cookie': loginResponse.headers['set-cookie']?.[0] || ''
        }
      });

      console.log('KG 1 class access result:', classResponse.body);
      
      // Also try accessing Creche
      const crecheResponse = await makeRequest({
        hostname: 'localhost',
        port: 9002,
        path: '/api/teacher/students/Creche',
        method: 'GET',
        headers: {
          'Cookie': loginResponse.headers['set-cookie']?.[0] || ''
        }
      });

      console.log('Creche class access result:', crecheResponse.body);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAdminClassAccess();