const http = require('http');

const imageUrl = 'http://localhost:5000/uploads/a1d654ad-c306-4007-a7d0-b190404f7d3a.png';

const req = http.get(imageUrl, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = [];
  res.on('data', (chunk) => {
    data.push(chunk);
  });
  
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    console.log(`📊 Response body: ${buffer.toString()}`);
    console.log(`📏 Received bytes: ${buffer.length}`);
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});
