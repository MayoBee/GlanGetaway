const mongoose = require('mongoose');
require('dotenv').config();

async function promoteCurrentUser() {
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
    
    // Find all users and show their current roles
    const allUsers = await User.find().select('firstName lastName email role isActive');
    console.log('👥 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    // Promote first non-admin user to admin (this is likely your current account)
    const userToPromote = allUsers.find(user => user.role !== 'admin');
    if (userToPromote) {
      console.log(`\n🔧 Promoting ${userToPromote.email} to admin role...`);
      await User.updateOne(
        { _id: userToPromote._id },
        { role: 'admin', isActive: true }
      );
      console.log('✅ User promoted to admin successfully!');
      
      console.log('\n🔑 Login credentials:');
      console.log(`   Email: ${userToPromote.email}`);
      console.log(`   Password: [your existing password]`);
      console.log('\n📝 Please logout and login again to refresh your permissions!');
      
    } else {
      console.log('\n✅ All users already have admin role');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Promotion completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

promoteCurrentUser();
