import { useMemo, useState } from "react";
import { AtSign, Eye, EyeOff, IdCard, KeyRound, Loader2, User } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", level: 1 };
  if (score <= 3) return { label: "Okay", level: 2 };
  return { label: "Strong", level: 3 };
}

export default function Register({ onRegister, onLogin, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  function handleSubmit(event) {
    event.preventDefault();
    onRegister(username.trim(), password, email.trim(), fullName.trim());
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="subtitle">Start tracking your expenses in minutes</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Username
            <div className="input-with-icon">
              <User size={17} />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
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
            {password && (
              <div className={`password-strength level-${strength.level}`}>
                <div className="password-strength-bar">
                  <span />
                  <span />
                  <span />
                </div>
                <small>{strength.label}</small>
              </div>
            )}
          </label>

          <label>
            Email
            <div className="input-with-icon">
              <AtSign size={17} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </label>

          <label>
            Full Name
            <div className="input-with-icon">
              <IdCard size={17} />
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
          </label>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : "Register"}
          </button>
        </form>

        <p className="register-text">
          Already have an account?{" "}
          <button className="link-btn" onClick={onLogin}>
            Login here
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}