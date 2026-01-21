import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';

dotenv.config();

const addAdmin = async () => {
  const email = process.argv[2];
  const firebaseUid = process.argv[3];
  const name = process.argv[4] || 'System Admin';

  if (!email || !firebaseUid) {
    console.error('Usage: npx ts-node scripts/addAdmin.ts <email> <firebaseUid> [name]');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ $or: [{ email }, { firebaseUid }] });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin);
    } else {
      const newAdmin = new Admin({
        email,
        firebaseUid,
        name,
        role: 'admin',
        status: 'active'
      });
      await newAdmin.save();
      console.log('Admin created successfully:', newAdmin);
    }
  } catch (error) {
    console.error('Error adding admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

addAdmin();