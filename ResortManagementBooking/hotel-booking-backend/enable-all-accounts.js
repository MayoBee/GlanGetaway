const mongoose = require('mongoose');
require('dotenv').config();

async function enableAllAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/hotel-booking');
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const User = mongoose.connection.collection('users');
    const allUsers = await User.find({}).toArray();
    
    console.log(`📊 Found ${allUsers.length} users in database`);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('\n👥 Current User Status:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log('');
    });
    
    // Enable all accounts
    console.log('🔧 Enabling all user accounts...');
    const result = await User.updateMany(
      {},
      { 
        $set: { 
          isActive: true,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} user accounts to active status`);
    
    // Verify the updates
    const updatedUsers = await User.find({}).toArray();
    console.log('\n👥 Updated User Status:');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Active: ${user.isActive} ✅`);
      console.log('');
    });
    
    await mongoose.disconnect();
    console.log('✅ All accounts enabled successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

enableAllAccounts();
