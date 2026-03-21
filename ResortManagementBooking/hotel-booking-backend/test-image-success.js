const http = require('http');

const imageUrl = 'http://localhost:5000/uploads/a1d654ad-c306-4007-a7d0-b190404f7d3a.png';

const req = http.get(imageUrl, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  console.log(`📋 Content-Type: ${res.headers['content-type']}`);
  console.log(`📏 Content-Length: ${res.headers['content-length']}`);
  console.log(`🔒 CORS: ${res.headers['access-control-allow-origin']}`);
  
  let data = [];
  res.on('data', (chunk) => {
    data.push(chunk);
  });
  
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    console.log(`📊 Received bytes: ${buffer.length}`);
    
    if (res.statusCode === 200 && buffer.length > 0) {
      console.log('✅ Image served successfully!');
      console.log(`🖼️ Image format: PNG (${buffer.length} bytes)`);
    } else {
      console.log('❌ Image failed to load');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});
