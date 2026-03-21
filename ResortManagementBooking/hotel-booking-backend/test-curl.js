const { exec } = require('child_process');

const imageUrl = 'http://localhost:5000/uploads/a1d654ad-c306-4007-a7d0-b190404f7d3a.png';

exec(`curl -I "${imageUrl}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error executing curl:', error.message);
    return;
  }
  
  console.log('📡 Curl Response:');
  console.log(stdout);
  
  if (stderr) {
    console.error('❌ Curl Error:', stderr);
  }
});
