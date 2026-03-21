const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const imageName = 'a1d654ad-c306-4007-a7d0-b190404f7d3a.png';
const imagePath = path.join(uploadsDir, imageName);

console.log('Uploads directory:', uploadsDir);
console.log('Image path:', imagePath);
console.log('File exists:', fs.existsSync(imagePath));

if (fs.existsSync(imagePath)) {
  const stats = fs.statSync(imagePath);
  console.log('File size:', stats.size, 'bytes');
  console.log('File is file:', stats.isFile());
} else {
  console.log('File does not exist!');
  
  // List all files in uploads directory
  const files = fs.readdirSync(uploadsDir);
  console.log('Files in uploads directory:', files);
}
