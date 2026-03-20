const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
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
    
    const count = await User.countDocuments();
    console.log(`📊 Total users in database: ${count}`);
    
    if (count === 0) {
      console.log('❌ No users found in database!');
      
      // Create some test users
      console.log('🔧 Creating test users...');
      const testUsers = [
        {
          firstName: 'John',
          lastName: 'Admin',
          email: 'admin@test.com',
          password: 'password123',
          role: 'admin',
          isActive: true,
          birthdate: new Date('1990-01-01')
        },
        {
          firstName: 'Jane',
          lastName: 'Owner',
          email: 'owner@test.com',
          password: 'password123',
          role: 'resort_owner',
          isActive: true,
          birthdate: new Date('1985-05-15')
        },
        {
          firstName: 'Bob',
          lastName: 'User',
          email: 'user@test.com',
          password: 'password123',
          role: 'user',
          isActive: true,
          birthdate: new Date('1992-08-20')
        }
      ];
      
      for (const userData of testUsers) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
      
      console.log('🎉 Test users created successfully!');
    } else {
      const users = await User.find().limit(5).select('firstName lastName email role isActive createdAt birthdate');
      console.log('👥 Sample users:');
      users.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role || 'user'}, Active: ${user.isActive}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
