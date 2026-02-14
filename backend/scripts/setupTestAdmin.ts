import mongoose from "mongoose";
import dotenv from "dotenv";
import admin from "firebase-admin";
import Admin from "../models/Admin";

dotenv.config();
// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "fortune-cloud-franchise-app",
  });
}
const setupTestAdmin = async () => {
  const email = "admin@fortunecloud.com";
  const password = "Pass@123";
  const name = "Test Admin";

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✓ Connected to MongoDB");

    let firebaseUid: string;

    // Try to create Firebase user
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        emailVerified: true,
        disabled: false,
      });
      firebaseUid = userRecord.uid;
      console.log("✓ Created Firebase user:", email);
      console.log("  Firebase UID:", firebaseUid);
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        // User already exists in Firebase, get their UID
        const userRecord = await admin.auth().getUserByEmail(email);
        firebaseUid = userRecord.uid;

        // Update password to ensure it matches
        await admin.auth().updateUser(firebaseUid, {
          password,
          emailVerified: true,
          disabled: false,
        });
        console.log("✓ Firebase user already exists, updated password");
        console.log("  Firebase UID:", firebaseUid);
      } else {
        throw error;
      }
    }

    // Check if admin already exists in MongoDB
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { firebaseUid }],
    });

    if (existingAdmin) {
      // Update existing admin
      existingAdmin.firebaseUid = firebaseUid;
      existingAdmin.email = email;
      existingAdmin.name = name;
      existingAdmin.role = "admin";
      existingAdmin.status = "active";
      await existingAdmin.save();
      console.log("✓ Updated existing MongoDB admin record");
    } else {
      // Create new admin
      const newAdmin = new Admin({
        email,
        firebaseUid,
        name,
        role: "admin",
        status: "active",
        deviceTokens: [],
      });
      await newAdmin.save();
      console.log("✓ Created MongoDB admin record");
    }

    console.log("\n✅ Test admin setup complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Error setting up test admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  }
};

setupTestAdmin();
