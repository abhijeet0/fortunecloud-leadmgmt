import express from "express";
import * as authController from "../controllers/authController";
import * as mockAuthController from "../controllers/mockAuthController";

const router = express.Router();

// Helper to check mock auth mode at runtime
const isMockAuthEnabled = () => process.env.USE_MOCK_AUTH === "true";

// Franchise signup endpoint
router.post("/franchise/signup", (req, res) => {
  if (isMockAuthEnabled()) {
    return mockAuthController.mockFranchiseSignup(req, res);
  }
  return authController.franchiseSignup(req, res);
});

// Franchise OTP verification (mock only)
router.post("/franchise/verify-otp", (req, res) => {
  if (isMockAuthEnabled()) {
    return mockAuthController.mockVerifyOTP(req, res);
  }
  res.status(404).json({ error: "Endpoint not available in Firebase mode" });
});

// Franchise login
router.post("/franchise/login", (req, res) => {
  if (isMockAuthEnabled()) {
    return mockAuthController.mockFranchiseLogin(req, res);
  }
  return authController.franchiseLogin(req, res);
});

// Franchise login OTP verification (mock only)
router.post("/franchise/verify-login-otp", (req, res) => {
  if (isMockAuthEnabled()) {
    return mockAuthController.mockVerifyLoginOTP(req, res);
  }
  res.status(404).json({ error: "Endpoint not available in Firebase mode" });
});

// Admin login - check mode on each request
router.post("/admin/login", (req, res) => {
  const useMock = isMockAuthEnabled();
  console.log(
    `🔐 Admin login request - USE_MOCK_AUTH: ${process.env.USE_MOCK_AUTH}, Mode: ${useMock ? "MOCK" : "FIREBASE"}`,
  );

  if (useMock) {
    console.log("🟣 Routing to MOCK admin login");
    return mockAuthController.mockAdminLogin(req, res);
  }
  console.log("🟠 Routing to FIREBASE admin login");
  return authController.adminLogin(req, res);
});

// Admin create (Firebase only)
router.post("/admin/create", (req, res) => {
  if (!isMockAuthEnabled()) {
    return authController.createAdmin(req, res);
  }
  res.status(404).json({ error: "Endpoint not available in mock mode" });
});

// Test endpoint to verify which mode is active
router.get("/test-mode", (req, res) => {
  const mode = isMockAuthEnabled() ? "MOCK" : "FIREBASE";
  res.json({
    mode,
    message: `${mode} authentication is active`,
    env: process.env.USE_MOCK_AUTH,
  });
});

export default router;
