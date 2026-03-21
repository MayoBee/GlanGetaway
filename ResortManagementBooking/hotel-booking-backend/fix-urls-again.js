const mongoose = require('mongoose');

async function fixUrlsAgain() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotel-booking');
    console.log('Connected to MongoDB');
    
    const Hotel = require('./dist/hotel-booking-backend/src/models/hotel').default;
    
    // Get all hotels
    const hotels = await Hotel.find({});
    console.log('Found', hotels.length, 'hotels to update');
    
    for (const hotel of hotels) {
      if (hotel.imageUrls && hotel.imageUrls.length > 0) {
        const updatedUrls = hotel.imageUrls.map(url => {
          // Replace localhost:7002 with localhost:5000
          return url.replace(/:7002/g, ':5000');
        });
        
        console.log(`Updating hotel: ${hotel.name}`);
        console.log('Old URLs:', hotel.imageUrls);
        console.log('New URLs:', updatedUrls);
        
        hotel.imageUrls = updatedUrls;
        await hotel.save();
        
        console.log('✅ Updated successfully');
        console.log('---');
      }
    }
    
    console.log('✅ All hotels updated successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

fixUrlsAgain();
