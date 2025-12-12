const http = require('http');

const url = 'http://localhost:9002/api/sba/class-assessment?className=Nursery%201&subject=Literacy&term=1';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
