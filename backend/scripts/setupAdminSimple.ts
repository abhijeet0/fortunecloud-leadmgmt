import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";

dotenv.config();

/**
 * Simple MongoDB-only admin setup for local testing
 *
 * This creates admin record in MongoDB with a dummy Firebase UID.
 * For actual Firebase login to work, you need to:
 *
 * 1. Go to Firebase Console: https://console.firebase.google.com
 * 2. Select your project: fortune-cloud-franchise-app
 * 3. Go to Authentication > Users > Add User
 * 4. Email: admin@fortunecloud.com
 * 5. Password: Pass@123
 * 6. After creation, copy the Firebase UID
 * 7. Re-run: npx ts-node scripts/setupAdminSimple.ts <firebase-uid>
 */

const setupAdminSimple = async () => {
  const email = "admin@fortunecloud.com";
  const name = "Test Admin";

  // Use provided UID or create dummy one
  const firebaseUid = process.argv[2] || `TEMP_UID_${Date.now()}`;
  const isDummy = !process.argv[2];

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✓ Connected to MongoDB");

    // Check existing
    let admin = await Admin.findOne({ email });

    if (admin) {
      admin.firebaseUid = firebaseUid;
      admin.name = name;
      admin.role = "admin";
      admin.status = "active";
      await admin.save();
      console.log("✓ Updated existing admin");
    } else {
      admin = new Admin({
        email,
        firebaseUid,
        name,
        role: "admin",
        status: "active",
        deviceTokens: [],
      });
      await admin.save();
      console.log("✓ Created new admin");
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Admin Record Created in MongoDB");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:     ", email);
    console.log("Firebase ID:", firebaseUid);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    if (isDummy) {
      console.log("⚠️  TEMP UID - Login won't work yet!\n");
      console.log("To enable actual login:");
      console.log("1. Go to Firebase Console > Authentication");
      console.log("2. Add user: admin@fortunecloud.com / Pass@123");
      console.log("3. Copy the Firebase UID");
      console.log("4. Run: npx ts-node scripts/setupAdminSimple.ts <uid>\n");
    } else {
      console.log("✅ Ready to login at web dashboard!");
      console.log("   Email: admin@fortunecloud.com");
      console.log("   Password: Pass@123\n");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

setupAdminSimple();
