const http = require('http');

// Test the new image service
const testUrls = [
  'http://localhost:5000/uploads/a1d654ad-c306-4007-a7d0-b190404f7d3a.png'
];

testUrls.forEach((url, index) => {
  console.log(`\n🧪 Testing image ${index + 1}: ${url}`);
  
  http.get(url, (res) => {
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
      } else {
        console.log('❌ Image failed to load');
      }
    });
  }).on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });
});
