const path = require('path');

console.log('Current directory:', __dirname);
console.log('Project root uploads path:', path.join(__dirname, '..', '..', 'uploads'));
console.log('Alternative path 1:', path.join(__dirname, '..', '..', '..', 'uploads'));
console.log('Alternative path 2:', path.join(__dirname, '..', '..', 'uploads'));
console.log('Alternative path 3:', path.join(__dirname, '..', '..', '..', '..', 'uploads'));

// Check if uploads exists in different locations
const fs = require('fs');

const paths = [
  path.join(__dirname, '..', '..', 'uploads'),
  path.join(__dirname, '..', '..', '..', 'uploads'),
  path.join(__dirname, '..', '..', '..', '..', 'uploads'),
  path.join(__dirname, '..', 'uploads'),
];

paths.forEach((p, i) => {
  console.log(`Path ${i + 1}: ${p}`);
  console.log(`  Exists: ${fs.existsSync(p)}`);
  if (fs.existsSync(p)) {
    const files = fs.readdirSync(p);
    console.log(`  Files: ${files.length} - ${files.slice(0, 3).join(', ')}`);
  }
  console.log('');
});
