const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdminLogin() {
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
    
    // Add pre-save middleware for password hashing
    userSchema.pre("save", async function (next) {
      if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
      }
      next();
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Check existing admin user
    const existingAdmin = await User.findOne({ email: 'admin@glangetaway.com' });
    
    if (existingAdmin) {
      console.log('🔧 Updating existing admin account...');
      
      // Update password and ensure proper hashing
      existingAdmin.password = 'admin123';
      existingAdmin.isActive = true;
      existingAdmin.role = 'admin';
      existingAdmin.birthdate = new Date('1990-01-01');
      
      await existingAdmin.save();
      console.log('✅ Admin account updated successfully!');
      
    } else {
      console.log('🔧 Creating new admin account...');
      
      // Create new admin user
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
      console.log('✅ Admin account created successfully!');
    }
    
    // Test password verification
    const testUser = await User.findOne({ email: 'admin@glangetaway.com' });
    const isPasswordValid = await bcrypt.compare('admin123', testUser.password);
    
    console.log('\n👤 Admin Account Details:');
    console.log(`   Email: admin@glangetaway.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   Active: ${testUser.isActive}`);
    console.log(`   Password Valid: ${isPasswordValid}`);
    
    // Show all users
    const allUsers = await User.find().select('firstName lastName email role isActive');
    console.log('\n👥 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Admin login fix completed');
    console.log('🔑 You can now login with:');
    console.log('   Email: admin@glangetaway.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdminLogin();
