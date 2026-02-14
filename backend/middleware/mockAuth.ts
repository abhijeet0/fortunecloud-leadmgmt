import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  uid?: string;
  email?: string;
  phone?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "local-testing-secret-key";

/**
 * Mock authentication middleware for local testing without Firebase
 * Validates JWT tokens issued by our mock auth endpoints
 */
export const mockAuthenticateFranchise = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      uid: string;
      email?: string;
      phone?: string;
      role?: string;
    };

    req.uid = decoded.uid;
    req.email = decoded.email;
    req.phone = decoded.phone;
    req.userRole = decoded.role;

    console.log(
      `✅ Mock franchise auth successful: ${decoded.email || decoded.phone}`,
    );
    next();
  } catch (error: any) {
    console.log(`❌ Mock franchise auth failed: ${error.message}`);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Mock admin authentication middleware for local testing
 */
export const mockAuthenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      uid: string;
      email?: string;
      role?: string;
    };

    if (decoded.role !== "admin") {
      console.log(
        `❌ Mock admin auth failed: Role is ${decoded.role}, expected admin`,
      );
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    req.uid = decoded.uid;
    req.email = decoded.email;
    req.userRole = decoded.role;

    console.log(`✅ Mock admin auth successful: ${decoded.email}`);
    next();
  } catch (error: any) {
    console.log(`❌ Mock admin auth failed: ${error.message}`);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Generate a JWT token for testing
 */
export const generateMockToken = (payload: {
  uid: string;
  email?: string;
  phone?: string;
  role?: string;
}): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
