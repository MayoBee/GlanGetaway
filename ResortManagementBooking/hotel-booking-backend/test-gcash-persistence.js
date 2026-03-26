// Test script to verify gcashNumber field persistence
const axios = require('axios');

async function testGcashNumber() {
  try {
    // Test data with gcashNumber
    const testHotel = {
      name: "Test Resort for GCash",
      city: "Test City", 
      country: "Test Country",
      description: "Test description",
      type: ["beach-resort"],
      dayRate: 1000,
      nightRate: 1500,
      hasDayRate: true,
      hasNightRate: true,
      starRating: 4,
      facilities: ["pool", "wifi"],
      gcashNumber: "09123456789", // This should now be saved
      downPaymentPercentage: 30
    };

    console.log('Testing gcashNumber persistence...');
    console.log('Sending data:', JSON.stringify(testHotel, null, 2));

    // You'll need to add your auth token here
    const response = await axios.post('http://localhost:7000/api/my-hotels/json', testHotel, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE'
      }
    });

    console.log('Response:', response.data);
    console.log('✅ gcashNumber in response:', response.data.gcashNumber);
    console.log('✅ downPaymentPercentage in response:', response.data.downPaymentPercentage);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testGcashNumber();
