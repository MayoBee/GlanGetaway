const http = require('http');

http.get('http://localhost:5000/uploads/a1d654ad-c306-4007-a7d0-b190404f7d3a.png', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Length:', res.headers['content-length']);
  
  if (res.statusCode === 200) {
    console.log('✅ Image serving successfully!');
  } else {
    console.log('❌ Image failed to load');
  }
}).on('error', (err) => {
  console.error('❌ Request error:', err.message);
});
