import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';

dotenv.config();

const updateAdmin = async () => {
  const email = process.argv[2];
  const firebaseUid = process.argv[3];
  const name = process.argv[4] || 'Admin';

  if (!email || !firebaseUid) {
    console.error('Usage: npx ts-node scripts/updateAdmin.ts <email> <firebaseUid> [name]');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Update the existing record for this UID with the correct email
    const result = await Admin.findOneAndUpdate(
      { firebaseUid },
      { email, name },
      { new: true, upsert: true }
    );
    
    console.log('Admin record updated successfully:', result);
  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateAdmin();