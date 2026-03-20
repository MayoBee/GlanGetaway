const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/hotel-booking');
    console.log('✅ Connected to MongoDB');
    
    // Find the admin user
    const User = mongoose.connection.collection('users');
    const adminUser = await User.findOne({ email: 'admin@glangetaway.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('🔧 Fixing admin password...');
    
    // Hash the password properly
    const hashedPassword = await bcrypt.hash('admin123', 8);
    
    // Update the user with properly hashed password
    await User.updateOne(
      { _id: adminUser._id },
      { 
        $set: {
          password: hashedPassword,
          isActive: true,
          role: 'admin'
        }
      }
    );
    
    // Test the password
    const updatedUser = await User.findOne({ email: 'admin@glangetaway.com' });
    const isPasswordValid = await bcrypt.compare('admin123', updatedUser.password);
    
    console.log('\n👤 Fixed Admin Account:');
    console.log(`   Email: admin@glangetaway.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Active: ${updatedUser.isActive}`);
    console.log(`   Password Valid: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      console.log('\n✅ Admin login is now fixed!');
      console.log('🔑 You can now login with:');
      console.log('   Email: admin@glangetaway.com');
      console.log('   Password: admin123');
    } else {
      console.log('\n❌ Password validation still failing');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdminPassword();
