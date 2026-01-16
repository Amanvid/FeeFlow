// Test script to check admin privileges
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

async function testAdminPrivileges() {
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
      // Now check the session
      const sessionResponse = await makeRequest({
        hostname: 'localhost',
        port: 9002,
        path: '/api/auth/teacher-session',
        method: 'GET',
        headers: {
          'Cookie': loginResponse.headers['set-cookie']?.[0] || ''
        }
      });

      console.log('Session result:', sessionResponse.body);

      // Now check classes
      const classesResponse = await makeRequest({
        hostname: 'localhost',
        port: 9002,
        path: '/api/teacher/classes',
        method: 'GET',
        headers: {
          'Cookie': loginResponse.headers['set-cookie']?.[0] || ''
        }
      });

      console.log('Classes result:', classesResponse.body);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAdminPrivileges();