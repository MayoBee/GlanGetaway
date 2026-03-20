const mongoose = require('mongoose');
require('dotenv').config();

async function removeSuperAdmin() {
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
    
    // Find and remove the Super Admin account
    const superAdmin = await User.findOne({ email: 'superadmin@glangetaway.com' });
    
    if (superAdmin) {
      await User.deleteOne({ _id: superAdmin._id });
      console.log('✅ Super Admin account removed successfully!');
      console.log(`   Removed: ${superAdmin.firstName} ${superAdmin.lastName} (${superAdmin.email})`);
    } else {
      console.log('ℹ️ Super Admin account not found');
    }
    
    // Show remaining users
    const remainingUsers = await User.find().select('firstName lastName email role isActive');
    console.log('\n👥 Remaining users in database:');
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Super Admin removal completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeSuperAdmin();
