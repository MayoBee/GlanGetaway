const mongoose = require('mongoose');

async function checkCurrentUrls() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotel-booking');
    console.log('Connected to MongoDB');
    
    const Hotel = require('./dist/hotel-booking-backend/src/models/hotel').default;
    
    // Get all hotels
    const hotels = await Hotel.find({});
    console.log('All hotels in database:');
    hotels.forEach(hotel => {
      console.log('Name:', hotel.name);
      console.log('Image URLs:', JSON.stringify(hotel.imageUrls, null, 2));
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

checkCurrentUrls();
