import mongoose from 'mongoose';
import Hotel from '../models/hotel';

async function migrateResortStatus() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/hotel-booking';
    await mongoose.connect(mongoUri);
    console.log('Connected to database');

    // Step 1: Set isApproved to true for resorts where isApproved is null or undefined
    const result1 = await Hotel.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: true } }
    );
    console.log(`Updated ${result1.modifiedCount} resorts to set isApproved to true`);

    // Step 2: Populate status field based on isApproved
    const result2 = await Hotel.updateMany(
      {},
      [
        {
          $set: {
            status: {
              $cond: {
                if: { $eq: ['$isApproved', true] },
                then: 'approved',
                else: 'pending'
              }
            }
          }
        }
      ]
    );
    console.log(`Updated ${result2.modifiedCount} resorts with status based on isApproved`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateResortStatus();