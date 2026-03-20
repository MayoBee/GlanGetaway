const mongoose = require('mongoose');
require('dotenv').config();

async function checkUserRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/hotel-booking');
    console.log('✅ Connected to MongoDB');
    
    // Get all users and their roles
    const User = mongoose.connection.collection('users');
    const allUsers = await User.find({}).toArray();
    
    console.log('👥 Current User Roles in Database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   isAdmin: ${user.role === 'admin'}`);
      console.log(`   isResortOwner: ${user.role === 'resort_owner'}`);
      console.log('');
    });
    
    await mongoose.disconnect();
    console.log('✅ Role check completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserRoles();
