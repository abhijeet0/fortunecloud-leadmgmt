import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Firebase imports - commented for local testing
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth, requestNotificationPermission } from '../firebase';
import { authAPI } from "../api";
import "./LoginPage.css";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

// Set to true for local testing without Firebase
const USE_MOCK_AUTH = true;

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (USE_MOCK_AUTH) {
        // Mock auth mode - call backend directly with email/password
        const response = await fetch(
          "http://localhost:5001/api/auth/admin/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Login failed");
        }

        const data = await response.json();
        const { token, user } = data;

        // Store token and user info
        localStorage.setItem("adminToken", token);
        localStorage.setItem("admin", JSON.stringify(user));

        console.log("✅ Mock login successful:", user.email);

        onLoginSuccess();
        navigate("/dashboard");
      } else {
        // Firebase auth mode (production)
        /* 
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        const response = await authAPI.adminLogin(idToken);

        localStorage.setItem('adminToken', idToken);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));

        const deviceToken = await requestNotificationPermission();
        if (deviceToken) {
          localStorage.setItem('deviceToken', deviceToken);
        }

        onLoginSuccess();
        navigate('/dashboard');
        */
        throw new Error(
          "Firebase mode not enabled. Set USE_MOCK_AUTH to true for local testing.",
        );
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Fortune Cloud Admin</h1>
        <p>Welcome back! Please login to continue.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@fortunecloud.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
