const mongoose = require('mongoose');
require('dotenv').config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/hotel-booking');
    console.log('✅ Connected to MongoDB');
    
    // Test the admin login
    const User = mongoose.connection.collection('users');
    const adminUser = await User.findOne({ email: 'admin@glangetaway.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Admin User Found:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Has Password: ${!!adminUser.password}`);
    console.log(`   Password Length: ${adminUser.password?.length}`);
    
    // Test password format (should be hashed)
    const bcrypt = require('bcryptjs');
    const isPasswordHashed = adminUser.password.startsWith('$2');
    console.log(`   Password Hashed: ${isPasswordHashed}`);
    
    if (isPasswordHashed) {
      const isValid = await bcrypt.compare('admin123', adminUser.password);
      console.log(`   Password Valid: ${isValid}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Login test completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
