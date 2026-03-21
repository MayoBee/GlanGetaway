const http = require('http');

// Test if the image is accessible
const imageUrl = 'http://localhost:5000/uploads/a1d654ad-c306-4007-a7d0-b190404f7d3a.png';

http.get(imageUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Length:', res.headers['content-length']);
  
  let data = [];
  res.on('data', (chunk) => {
    data.push(chunk);
  });
  
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    console.log('Received bytes:', buffer.length);
    
    if (res.statusCode === 200 && buffer.length > 0) {
      console.log('✅ Image is accessible and has content');
    } else {
      console.log('❌ Image is not accessible or empty');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error accessing image:', err.message);
});
