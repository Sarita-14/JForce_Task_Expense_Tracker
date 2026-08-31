import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, User } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Login({ onLogin, onRegister, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    onLogin(username.trim(), password);
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Login to manage your expenses</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Username
            <div className="input-with-icon">
              <User size={17} />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-with-icon">
              <KeyRound size={17} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : "Login"}
          </button>
        </form>

        <p className="register-text">
          New user?{" "}
          <button className="link-btn" onClick={onRegister}>
            Register here
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}