const fs = require('fs');

// Read the current my-hotels.ts file
const filePath = './src/routes/my-hotels.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix POST endpoint cottage type definition (around line 298)
content = content.replace(
  /const cottages: Array<{\s*id: string;\s*name: string;\s*type: string;\s*pricePerNight: number;\s*maxOccupancy: number;\s*description\?: string;\s*amenities\?: string\[\];\s*}> = \[\];/,
  `const cottages: Array<{
    id: string;
    name: string;
    type: string;
    pricePerNight: number;
    dayRate: number;
    nightRate: number;
    hasDayRate: boolean;
    hasNightRate: boolean;
    maxOccupancy: number;
    description?: string;
    amenities?: string[];
  }> = [];`
);

// Fix POST endpoint cottage data assignment (around line 317)
content = content.replace(
  /cottages\.push\(\{\s*id: req\.body\[\`cottages\[\$\{cottageIndex\}\]\[id\]\`,\s*name: req\.body\[\`cottages\[\$\{cottageIndex\}\]\[name\]\`,\s*type: req\.body\[\`cottages\[\$\{cottageIndex\}\]\[type\]\`,\s*pricePerNight: parseFloat\(req\.body\[\`cottages\[\$\{cottageIndex\}\]\[pricePerNight\]\`\) \|\| 0,\s*maxOccupancy: parseInt\(req\.body\[\`cottages\[\$\{cottageIndex\}\]\[maxOccupancy\]\`\) \|\| 1,\s*description: req\.body\[\`cottages\[\$\{cottageIndex\}\]\[description\]\` \|\| "",\s*amenities: cottageAmenities,\s*\}\);/,
  `cottages.push({
          id: req.body[\`cottages[\${cottageIndex}][id]\`],
          name: req.body[\`cottages[\${cottageIndex}][name]\`],
          type: req.body[\`cottages[\${cottageIndex}][type]\`],
          pricePerNight: parseFloat(req.body[\`cottages[\${cottageIndex}][pricePerNight]\`]) || 0,
          dayRate: parseFloat(req.body[\`cottages[\${cottageIndex}][dayRate]\`]) || 0,
          nightRate: parseFloat(req.body[\`cottages[\${cottageIndex}][nightRate]\`]) || 0,
          hasDayRate: req.body[\`cottages[\${cottageIndex}][hasDayRate]\`] === "true" || req.body[\`cottages[\${cottageIndex}][hasDayRate]\`] === true,
          hasNightRate: req.body[\`cottages[\${cottageIndex}][hasNightRate]\`] === "true" || req.body[\`cottages[\${cottageIndex}][hasNightRate]\`] === true,
          maxOccupancy: parseInt(req.body[\`cottages[\${cottageIndex}][maxOccupancy]\`]) || 1,
          description: req.body[\`cottages[\${cottageIndex}][description]\`] || "",
          amenities: cottageAmenities,
        });`
);

// Fix PUT endpoint cottage type definition (around line 657)
content = content.replace(
  /const cottages: Array<{\s*id: string;\s*name: string;\s*type: string;\s*pricePerNight: number;\s*maxOccupancy: number;\s*description\?: string;\s*amenities\?: string\[\];\s*}> = \[\];/,
  `const cottages: Array<{
    id: string;
    name: string;
    type: string;
    pricePerNight: number;
    dayRate: number;
    nightRate: number;
    hasDayRate: boolean;
    hasNightRate: boolean;
    maxOccupancy: number;
    description?: string;
    amenities?: string[];
  }> = [];`
);

// Fix PUT endpoint cottage data assignment (around line 675)
content = content.replace(
  /cottages\.push\(\{\s*id: req\.body\[\`cottages\[\$\{cottageIndex\}\]\[id\]\`,\s*name: req\.body\[\`cottages\[\$\{cottageIndex\}\]\[name\]\`,\s*type: req\.body\[\`cottages\[\$\{cottageIndex\}\]\[type\]\`,\s*pricePerNight: parseFloat\(req\.body\[\`cottages\[\$\{cottageIndex\}\]\[pricePerNight\]\`\) \|\| 0,\s*maxOccupancy: parseInt\(req\.body\[\`cottages\[\$\{cottageIndex\}\]\[maxOccupancy\]\`\) \|\| 1,\s*description: req\.body\[\`cottages\[\$\{cottageIndex\}\]\[description\]\` \|\| "",\s*amenities: cottageAmenities,\s*\}\);/,
  `cottages.push({
          id: req.body[\`cottages[\${cottageIndex}][id]\`],
          name: req.body[\`cottages[\${cottageIndex}][name]\`],
          type: req.body[\`cottages[\${cottageIndex}][type]\`],
          pricePerNight: parseFloat(req.body[\`cottages[\${cottageIndex}][pricePerNight]\`]) || 0,
          dayRate: parseFloat(req.body[\`cottages[\${cottageIndex}][dayRate]\`]) || 0,
          nightRate: parseFloat(req.body[\`cottages[\${cottageIndex}][nightRate]\`]) || 0,
          hasDayRate: req.body[\`cottages[\${cottageIndex}][hasDayRate]\`] === "true" || req.body[\`cottages[\${cottageIndex}][hasDayRate]\`] === true,
          hasNightRate: req.body[\`cottages[\${cottageIndex}][hasNightRate]\`] === "true" || req.body[\`cottages[\${cottageIndex}][hasNightRate]\`] === true,
          maxOccupancy: parseInt(req.body[\`cottages[\${cottageIndex}][maxOccupancy]\`]) || 1,
          description: req.body[\`cottages[\${cottageIndex}][description]\`] || "",
          amenities: cottageAmenities,
        });`
);

// Write the fixed content back
fs.writeFileSync(filePath, content);

console.log('✅ Fixed cottage day/night rate fields in both POST and PUT endpoints');
console.log('📝 Both endpoints now handle:');
console.log('   - dayRate');
console.log('   - nightRate'); 
console.log('   - hasDayRate');
console.log('   - hasNightRate');
console.log('\n🔄 Restart your server to apply changes');
