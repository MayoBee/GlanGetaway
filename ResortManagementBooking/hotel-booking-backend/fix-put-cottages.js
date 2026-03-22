const fs = require('fs');

// Read the current file
const filePath = './src/routes/my-hotels.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix PUT endpoint - add the 4 missing lines after line 679
const oldBlock = `          pricePerNight: parseFloat(req.body[\`cottages[\${cottageIndex}][pricePerNight]\`]) || 0,
          maxOccupancy: parseInt(req.body[\`cottages[\${cottageIndex}][maxOccupancy]\`]) || 1,
          description: req.body[\`cottages[\${cottageIndex}][description]\`] || "",
          amenities: cottageAmenities,`;

const newBlock = `          pricePerNight: parseFloat(req.body[\`cottages[\${cottageIndex}][pricePerNight]\`]) || 0,
          dayRate: parseFloat(req.body[\`cottages[\${cottageIndex}][dayRate]\`]) || 0,
          nightRate: parseFloat(req.body[\`cottages[\${cottageIndex}][nightRate]\`]) || 0,
          hasDayRate: req.body[\`cottages[\${cottageIndex}][hasDayRate]\`] === "true" || req.body[\`cottages[\${cottageIndex}][hasDayRate]\`] === true,
          hasNightRate: req.body[\`cottages[\${cottageIndex}][hasNightRate]\`] === "true" || req.body[\`cottages[\${cottageIndex}][hasNightRate]\`] === true,
          maxOccupancy: parseInt(req.body[\`cottages[\${cottageIndex}][maxOccupancy]\`]) || 1,
          description: req.body[\`cottages[\${cottageIndex}][description]\`] || "",
          amenities: cottageAmenities,`;

content = content.replace(oldBlock, newBlock);

// Write back
fs.writeFileSync(filePath, content);

console.log('✅ Fixed PUT endpoint cottage fields');
console.log('🔄 Restart server to apply changes');
