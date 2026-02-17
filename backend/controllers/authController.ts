import { Response } from 'express';
import admin from 'firebase-admin';
import Franchise from '../models/Franchise';
import AdminModel from '../models/Admin';
import { AuthRequest } from '../middleware/auth';

export const franchiseSignup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, franchiseName, ownerName, email, city, password, idToken } = req.body;

    if (!phone || !franchiseName || !ownerName || !email || !city) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phone)) {
      res.status(400).json({ error: 'Invalid phone number format. Must be 10 digits.' });
      return;
    }

    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const existingFranchise = await Franchise.findOne({
      $or: [{ phone }, { email }],
    });

    if (existingFranchise) {
      res.status(400).json({ error: 'Phone or email already registered' });
      return;
    }

    let firebaseUid = '';
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      firebaseUid = decodedToken.uid;
    } else {
      if (!password) {
        res.status(400).json({ error: 'Password is required' });
        return;
      }
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: ownerName,
      });
      firebaseUid = userRecord.uid;
    }

    const franchise = new Franchise({
      firebaseUid,
      phone,
      franchiseName,
      ownerName,
      email,
      city,
      isVerified: true,
      status: 'active',
    });

    await franchise.save();

    res.status(201).json({
      message: 'Franchise registered successfully',
      franchiseId: franchise._id,
      token: idToken,
      franchise: {
        id: franchise._id,
        firebaseUid: franchise.firebaseUid,
        phone: franchise.phone,
        franchiseName: franchise.franchiseName,
        ownerName: franchise.ownerName,
        email: franchise.email,
        city: franchise.city,
        isVerified: franchise.isVerified,
        commissionPercentage: franchise.commissionPercentage,
        status: franchise.status,
      },
    });
  } catch (error: any) {
    if (error.code === 'auth/phone-number-already-exists') {
      res.status(400).json({ error: 'Phone number already registered' });
      return;
    }
    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};

export const franchiseLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'ID token required' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const franchise = await Franchise.findOne({ firebaseUid: decodedToken.uid });

    if (!franchise) {
      res.status(401).json({ error: 'Franchise not found' });
      return;
    }

    if (franchise.status === 'suspended') {
      res.status(403).json({ error: 'Account is suspended' });
      return;
    }

    res.json({
      message: 'Login successful',
      token: idToken,
      franchise: {
        id: franchise._id,
        firebaseUid: franchise.firebaseUid,
        phone: franchise.phone,
        franchiseName: franchise.franchiseName,
        email: franchise.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid token or login failed', details: error.message });
  }
};

export const adminLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'ID token required' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const adminUser = await AdminModel.findOne({ firebaseUid: decodedToken.uid });

    if (!adminUser) {
      console.log(`Admin login failed: UID ${decodedToken.uid} not found in MongoDB`);
      res.status(401).json({ 
        error: 'Admin user not found', 
        details: `Your UID (${decodedToken.uid}) is not registered in the database.` 
      });
      return;
    }

    if (adminUser.status === 'inactive') {
      res.status(403).json({ error: 'Admin account is inactive' });
      return;
    }

    const customClaims = (decodedToken as any) || {};

    res.json({
      message: 'Login successful',
      token: idToken,
      admin: {
        id: adminUser._id,
        firebaseUid: adminUser.firebaseUid,
        email: adminUser.email,
        name: adminUser.name,
        role: customClaims.role || 'admin',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid token or login failed', details: error.message });
  }
};

export const createAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: role || 'admin',
    });

    const adminUser = new AdminModel({
      firebaseUid: userRecord.uid,
      email,
      name,
      role: role || 'admin',
      status: 'active',
    });

    await adminUser.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: adminUser._id,
        firebaseUid: userRecord.uid,
        email,
        name,
        role,
      },
    });
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};
