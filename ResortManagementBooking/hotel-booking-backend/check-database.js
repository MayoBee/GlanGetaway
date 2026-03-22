const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Find the most recently updated hotel
    mongoose.connection.db.collection('hotels')
      .find({})
      .sort({ lastUpdated: -1 })
      .limit(1)
      .toArray((err, hotels) => {
        if (err) {
          console.error('Error finding hotels:', err);
          process.exit(1);
        }
        
        if (hotels.length === 0) {
          console.log('No hotels found in database');
          process.exit(0);
        }
        
        const hotel = hotels[0];
        console.log('\n=== MOST RECENT HOTEL ===');
        console.log('Hotel ID:', hotel._id);
        console.log('Hotel Name:', hotel.name);
        console.log('Last Updated:', hotel.lastUpdated);
        
        console.log('\n=== ROOMS ===');
        if (hotel.rooms && hotel.rooms.length > 0) {
          console.log('Rooms found:', hotel.rooms.length);
          hotel.rooms.forEach((room, index) => {
            console.log(`Room ${index + 1}:`, room.name, '- Type:', room.type, '- Price:', room.pricePerNight);
          });
        } else {
          console.log('NO ROOMS FOUND');
        }
        
        console.log('\n=== COTTAGES ===');
        if (hotel.cottages && hotel.cottages.length > 0) {
          console.log('Cottages found:', hotel.cottages.length);
          hotel.cottages.forEach((cottage, index) => {
            console.log(`\nCottage ${index + 1}:`);
            console.log('  ID:', cottage.id);
            console.log('  Name:', cottage.name);
            console.log('  Type:', cottage.type);
            console.log('  Price Per Night:', cottage.pricePerNight);
            console.log('  Day Rate:', cottage.dayRate || 'UNDEFINED');
            console.log('  Night Rate:', cottage.nightRate || 'UNDEFINED');
            console.log('  Has Day Rate:', cottage.hasDayRate || 'UNDEFINED');
            console.log('  Has Night Rate:', cottage.hasNightRate || 'UNDEFINED');
            console.log('  Max Occupancy:', cottage.maxOccupancy);
            console.log('  Description:', cottage.description || 'NONE');
          });
        } else {
          console.log('NO COTTAGES FOUND');
        }
        
        console.log('\n=== ENTRANCE FEES ===');
        if (hotel.adultEntranceFee) {
          console.log('Adult Entrance Fee:');
          console.log('  Day Rate:', hotel.adultEntranceFee.dayRate);
          console.log('  Night Rate:', hotel.adultEntranceFee.nightRate);
          console.log('  Pricing Model:', hotel.adultEntranceFee.pricingModel);
          console.log('  Group Quantity:', hotel.adultEntranceFee.groupQuantity);
        } else {
          console.log('NO ADULT ENTRANCE FEE FOUND');
        }
        
        if (hotel.childEntranceFee && hotel.childEntranceFee.length > 0) {
          console.log('Child Entrance Fees found:', hotel.childEntranceFee.length);
          hotel.childEntranceFee.forEach((fee, index) => {
            console.log(`\nChild Fee ${index + 1}:`);
            console.log('  Age Range:', fee.minAge, '-', fee.maxAge);
            console.log('  Day Rate:', fee.dayRate);
            console.log('  Night Rate:', fee.nightRate);
            console.log('  Pricing Model:', fee.pricingModel);
          });
        } else {
          console.log('NO CHILD ENTRANCE FEES FOUND');
        }
        
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
