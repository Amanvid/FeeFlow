const http = require('http');

const url = 'http://localhost:9002/api/sba/class-assessment?className=Nursery%201&subject=Literacy&term=1';

console.log(`Fetching ${url}...`);

http.get(url, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      if (res.statusCode === 200) {
        const json = JSON.parse(data);
        console.log('Success! Records found:', json.records.length);
        if (json.records.length > 0) {
            console.log('Sample record:', json.records[0]);
        }
      } else {
        console.log('Error response:', data);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
  
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
