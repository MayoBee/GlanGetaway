const mongoose = require('mongoose');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/hotel-booking');
    console.log('✅ Connected to MongoDB');
    
    // Define User schema inline for this script
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: { type: String, enum: ["user", "admin", "resort_owner", "front_desk", "housekeeping"], default: "user" },
      isActive: { type: Boolean, default: true },
      birthdate: { type: Date, required: true },
      createdAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@glangetaway.com' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists. Updating role to admin...');
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ Updated existing user to admin role');
    } else {
      // Create admin user
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@glangetaway.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        birthdate: new Date('1990-01-01')
      });
      
      await adminUser.save();
      console.log('✅ Created admin user: admin@glangetaway.com');
    }
    
    // Show all users with their roles
    const allUsers = await User.find().select('firstName lastName email role isActive');
    console.log('\n👥 All users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Admin creation completed');
    console.log('🔑 You can now login with:');
    console.log('   Email: admin@glangetaway.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
