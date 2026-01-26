import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, validation and auth would happen here
    navigate('/app/dashboard');
  };

  return (
    <div className="login-form-container">
      <div className="form-wrapper">
        <div className="brand-logo">
          <div className="logo-icon">
            <span>HR</span>
            <div className="roof"></div>
          </div>
        </div>

        <h2 className="welcome-text">Welcome Back</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input type="text" placeholder="Email/Employee ID" required />
            <span className="input-helper">you@company.com</span>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
              {/* Using text for simplicity, could use icon later */}
            </button>
          </div>

          <div className="form-actions">
            <a href="#" className="forgot-password">Forgot Password?</a>
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
          </div>

          <button type="submit" className="sign-in-btn">Sign In</button>
        </form>

        <div className="login-footer">
          <span>Having trouble logging in? <a href="#">Contact</a></span>
        </div>
      </div>

      <style>{`
  .login-form-container {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

        .form-wrapper {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

        .brand-logo {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

        .logo-icon {
  font-weight: 800;
  font-size: 2rem;
  color: var(--primary-color);
  position: relative;
  display: inline-block;
  line-height: 1;
}

        /* Simple CSS representation of the logo */
        .roof {
  width: 100%;
  height: 10px;
  border-top: 4px solid var(--primary-color);
  border-left: 4px solid var(--primary-color);
  transform: rotate(45deg);
  position: absolute;
  top: -15px;
  left: 0;
  display: none; /* Hard to replicate exactly with simple css, skipping roof for clean text for now or simple icon */
}

        .welcome-text {
  font-size: 2rem;
  color: var(--text-main);
  margin-bottom: 2.5rem;
  font-weight: 700;
}

        .input-group {
  margin-bottom: 1.5rem;
  position: relative;
  text-align: left;
}

        .input-group input {
  width: 100%;
  padding: 1rem;
  padding-right: 3rem; /* For eye icon */
  border: 1px solid var(--border-input);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

        .input-group input:focus {
  border-color: var(--primary-color);
}

        .input-helper {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.85rem;
  pointer-events: none;
  display: none; /* Hide for now, can be placeholder */
}

        /* Show helper text inside input if empty? The design has placeholder 'Email/Employee ID' and helper text below? 
           Actually design has placeholder inside box, and small text below? No, it looks like placeholder.
        */

        .toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

        .form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

        .forgot-password {
  color: var(--text-secondary);
  text-decoration: none;
}

        .remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

        .sign-in-btn {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
  box-shadow: 0 4px 6px -1px rgba(13, 95, 104, 0.2);
}

        .sign-in-btn:hover {
  background-color: var(--primary-hover);
}

        .login-footer {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: right;
}
        
        .login-footer a {
  color: var(--text-secondary);
  font-weight: 600;
  text-decoration: none;
}
`}</style>
    </div>
  );
};

export default LoginForm;
