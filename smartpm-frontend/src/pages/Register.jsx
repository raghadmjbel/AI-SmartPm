import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";

export default function Register({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await register({ username, email, password });
      onLogin(response.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your values.");
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>Register</h1>
        <p>Create your account to start managing projects.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0b1020;
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 32px;
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.95);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
          color: #f8fafc;
        }
        .auth-card h1 {
          margin-bottom: 8px;
        }
        .auth-card p {
          color: #94a3b8;
          margin-bottom: 24px;
        }
        .auth-card label {
          display: block;
          margin-bottom: 16px;
          font-size: 0.95rem;
        }
        .auth-card input {
          width: 100%;
          margin-top: 8px;
          padding: 12px 14px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 12px;
          background: #111827;
          color: #f8fafc;
        }
        .auth-card button {
          width: 100%;
          padding: 14px 18px;
          margin-top: 10px;
          border: none;
          border-radius: 12px;
          background: #3b82f6;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }
        .auth-card .error {
          margin-top: 8px;
          padding: 10px;
          border-radius: 10px;
          background: #7f1d1d;
          color: #fee2e2;
        }
        .auth-card a {
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
}
