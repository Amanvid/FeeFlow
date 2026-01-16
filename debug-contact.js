const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: result });
        } catch {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 9002,
      path: '/api/auth/teacher-contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'Rosemond' });
    console.log('teacher-contact:', res);
  } catch (e) {
    console.error('error:', e);
  }
}

run();
