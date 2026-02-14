import { Response } from "express";
import Franchise from "../models/Franchise";
import AdminModel from "../models/Admin";
import { AuthRequest } from "../middleware/auth";
import { generateMockToken } from "../middleware/mockAuth";
import crypto from "crypto";

/**
 * Mock OTP storage (in-memory for local testing)
 * In production, use Redis or similar
 */
const otpStore = new Map<
  string,
  { otp: string; expiresAt: number; userData?: any }
>();

/**
 * Mock Franchise Signup - Request OTP
 */
export const mockFranchiseSignup = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { phone, franchiseName, ownerName, email, city } = req.body;

    if (!phone || !franchiseName || !ownerName || !email || !city) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Check if already exists
    const existingFranchise = await Franchise.findOne({
      $or: [{ phone }, { email }],
    });

    if (existingFranchise) {
      res.status(400).json({ error: "Phone or email already registered" });
      return;
    }

    // Generate mock OTP
    const otp = "123456"; // Fixed OTP for local testing
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP and user data
    otpStore.set(phone, {
      otp,
      expiresAt,
      userData: { phone, franchiseName, ownerName, email, city },
    });

    console.log(`📱 Mock OTP for ${phone}: ${otp}`);

    res.status(200).json({
      message: "OTP sent successfully",
      mockOtp: otp, // Include in response for testing
      expiresIn: 300, // seconds
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mock OTP Verification - Complete Signup
 */
export const mockVerifyOTP = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ error: "Phone and OTP required" });
      return;
    }

    // Verify OTP
    const storedData = otpStore.get(phone);

    if (!storedData) {
      res.status(400).json({ error: "OTP not found or expired" });
      return;
    }

    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(phone);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    // Create franchise
    const mockUid = `mock_${crypto.randomBytes(16).toString("hex")}`;
    const { franchiseName, ownerName, email, city } = storedData.userData;

    const franchise = new Franchise({
      firebaseUid: mockUid,
      phone,
      franchiseName,
      ownerName,
      email,
      city,
      isVerified: true,
      status: "active",
    });

    await franchise.save();

    // Generate JWT token
    const token = generateMockToken({
      uid: mockUid,
      email,
      phone,
      role: "franchise",
    });

    // Clean up OTP
    otpStore.delete(phone);

    res.status(201).json({
      message: "Franchise registered successfully",
      token,
      franchise: {
        id: franchise._id,
        firebaseUid: mockUid,
        franchiseName,
        ownerName,
        email,
        phone,
        city,
        isVerified: true,
        commissionPercentage: franchise.commissionPercentage || 10,
        status: "active",
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mock Franchise Login - Request OTP
 */
export const mockFranchiseLogin = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: "Phone number required" });
      return;
    }

    // Check if franchise exists
    const franchise = await Franchise.findOne({ phone });

    if (!franchise) {
      res.status(404).json({ error: "Franchise not found" });
      return;
    }

    // Generate mock OTP
    const otp = "123456";
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(phone, {
      otp,
      expiresAt,
      userData: { franchiseId: franchise._id, uid: franchise.firebaseUid },
    });

    console.log(`📱 Mock OTP for login ${phone}: ${otp}`);

    res.status(200).json({
      message: "OTP sent successfully",
      mockOtp: otp,
      expiresIn: 300,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mock Login OTP Verification
 */
export const mockVerifyLoginOTP = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ error: "Phone and OTP required" });
      return;
    }

    // Verify OTP
    const storedData = otpStore.get(phone);

    if (!storedData) {
      res.status(400).json({ error: "OTP not found or expired" });
      return;
    }

    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(phone);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    // Get franchise
    const franchise = await Franchise.findById(storedData.userData.franchiseId);

    if (!franchise) {
      res.status(404).json({ error: "Franchise not found" });
      return;
    }

    // Generate JWT token
    const token = generateMockToken({
      uid: franchise.firebaseUid,
      email: franchise.email,
      phone: franchise.phone,
      role: "franchise",
    });

    // Clean up OTP
    otpStore.delete(phone);

    res.status(200).json({
      message: "Login successful",
      token,
      franchise: {
        id: franchise._id,
        firebaseUid: franchise.firebaseUid,
        franchiseName: franchise.franchiseName,
        ownerName: franchise.ownerName,
        email: franchise.email,
        phone: franchise.phone,
        city: franchise.city,
        isVerified: franchise.isVerified,
        commissionPercentage: franchise.commissionPercentage || 10,
        status: franchise.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mock Admin Login (Email/Password)
 */
export const mockAdminLogin = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    // For local testing, accept any password for admin@fortunecloud.com
    if (email === "admin@fortunecloud.com" && password === "Pass@123") {
      // Get admin from database
      let admin = await AdminModel.findOne({ email });

      if (!admin) {
        // Create admin if doesn't exist
        const mockUid = `admin_${crypto.randomBytes(16).toString("hex")}`;
        admin = new AdminModel({
          firebaseUid: mockUid,
          email,
          name: "Test Admin",
          role: "admin",
          status: "active",
          deviceTokens: [],
        });
        await admin.save();
      }

      // Generate JWT token
      const token = generateMockToken({
        uid: admin.firebaseUid,
        email: admin.email,
        role: "admin",
      });

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          uid: admin.firebaseUid,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
