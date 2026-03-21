const mongoose = require('mongoose');

async function fixImageReferences() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotel-booking');
    console.log('Connected to MongoDB');
    
    const Hotel = require('./dist/hotel-booking-backend/src/models/hotel').default;
    
    // Get all hotels
    const hotels = await Hotel.find({});
    console.log('Found', hotels.length, 'hotels to update');
    
    // Use the actual file that exists
    const existingFile = 'a1d654ad-c306-4007-a7d0-b190404f7d3a.png';
    const correctUrl = `http://localhost:5000/uploads/${existingFile}`;
    
    for (const hotel of hotels) {
      console.log(`Updating hotel: ${hotel.name}`);
      console.log('Old URLs:', hotel.imageUrls);
      
      // Update with the correct URL
      hotel.imageUrls = [correctUrl];
      
      await hotel.save();
      
      console.log('New URLs:', hotel.imageUrls);
      console.log('✅ Updated successfully');
      console.log('---');
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

fixImageReferences();
