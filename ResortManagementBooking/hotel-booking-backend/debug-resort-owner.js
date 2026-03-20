const mongoose = require('mongoose');
require('dotenv').config();

async function debugResortOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/hotel-booking');
    console.log('✅ Connected to MongoDB');
    
    // Get the resort owner user
    const User = mongoose.connection.collection('users');
    const resortOwner = await User.findOne({ email: 'biennickwadingan@gmail.com' });
    
    if (!resortOwner) {
      console.log('❌ Resort owner not found');
      return;
    }
    
    console.log('👤 Resort Owner Account Details:');
    console.log(`   Email: ${resortOwner.email}`);
    console.log(`   Name: ${resortOwner.firstName} ${resortOwner.lastName}`);
    console.log(`   Role: ${resortOwner.role}`);
    console.log(`   Active: ${resortOwner.isActive}`);
    console.log(`   Created: ${new Date(resortOwner.createdAt).toLocaleDateString()}`);
    
    // Check what permissions this role should have
    console.log('\n🔍 Expected Permissions:');
    console.log(`   isAdmin: ${resortOwner.role === 'admin'}`);
    console.log(`   isResortOwner: ${resortOwner.role === 'resort_owner'}`);
    console.log(`   canManageOwnResorts: ${resortOwner.role === 'resort_owner' || resortOwner.role === 'admin'}`);
    
    // Also check admin user for comparison
    const adminUser = await User.findOne({ email: 'admin@glangetaway.com' });
    if (adminUser) {
      console.log('\n👤 Admin Account Details (for comparison):');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   isAdmin: ${adminUser.role === 'admin'}`);
      console.log(`   canManageOwnResorts: ${adminUser.role === 'resort_owner' || adminUser.role === 'admin'}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugResortOwner();
