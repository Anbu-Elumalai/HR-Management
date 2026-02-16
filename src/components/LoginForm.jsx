import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import api from '../api/api';

const LoginForm = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ phone: '', pin: '' });
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 10) {
      setPhone(value);
      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
    }
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (fieldErrors.pin) setFieldErrors({ ...fieldErrors, pin: '' });

    // Auto focus next input
    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const newFieldErrors = { phone: '', pin: '' };

    // Validation
    let hasError = false;
    if (phone.length === 0) {
      newFieldErrors.phone = 'Please enter your phone number';
      hasError = true;
    } else if (phone.length !== 10) {
      newFieldErrors.phone = 'Please enter a valid 10-digit phone number';
      hasError = true;
    }

    const pinValue = pin.join('');
    if (pinValue.length !== 4) {
      newFieldErrors.pin = 'Please enter a complete 4-digit PIN';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        phoneNumber: phone,
        pin: pinValue,
      });

      const result = response.data;

      if (response.status === 200 || response.status === 201) {
        // Success
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('userType', result.data.userType);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        navigate('/app/dashboard');
      } else {
        // API Error
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Connection error. Is the server running?';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="form-wrapper">
        <div className="brand-logo">
          <div className="logo-icon">
            <span>HR</span>
          </div>
        </div>

        <h2 className="welcome-text">Welcome Back</h2>

        <form onSubmit={handleLogin} className="login-form-main">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <div className="input-with-icon">
              <Phone className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={handlePhoneChange}
                className={fieldErrors.phone ? 'error' : ''}
              />
            </div>
            {fieldErrors.phone && <div className="field-error-text">{fieldErrors.phone}</div>}
          </div>

          <div className="input-group">
            <label className="input-label">4-digit PIN</label>
            <div className="login-pin-container">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="password"
                  maxLength="1"
                  className={`login-pin-box ${fieldErrors.pin ? 'error' : ''}`}
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && idx > 0) {
                      document.getElementById(`pin-${idx - 1}`).focus();
                    }
                  }}
                />
              ))}
            </div>
            {fieldErrors.pin && <div className="field-error-text">{fieldErrors.pin}</div>}
          </div>

          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="sign-in-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <span>Having trouble signing in? <a href="#">Contact Us</a></span>
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
            max-width: 420px;
            text-align: center;
            padding: 0.5rem 0; /* Further reduced */
        }

        .brand-logo {
            margin-bottom: 0.5rem;
            display: flex;
            justify-content: center;
        }

        .logo-icon {
            font-weight: 800;
            font-size: 2.5rem; /* Reduced from 3.5rem */
            color: #0d5f68;
            position: relative;
            display: inline-block;
        }

        .welcome-text {
            font-size: 1.75rem; /* Reduced from 2.25rem */
            color: #1a2e35;
            margin-bottom: 0.75rem; /* Reduced */
            font-weight: 800;
            letter-spacing: -0.5px;
        }

        .login-form-main {
            display: flex;
            flex-direction: column;
            gap: 1rem; /* Reduced from 1.25rem */
            padding: 0 0.5rem;
        }

        .error-message {
            background-color: #fee2e2;
            color: #ef4444;
            padding: 0.75rem;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
            text-align: center;
        }

        .input-group {
            text-align: left;
            margin-bottom: 0.5rem;
        }

        .input-label {
            display: block;
            font-size: 0.95rem; /* Slightly smaller */
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 0.5rem; /* Reduced from 0.75rem */
        }

        .input-with-icon {
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-icon {
            position: absolute;
            left: 1.25rem;
            color: #6b7280;
        }

        .input-with-icon input {
            padding-left: 3.5rem !important;
        }

        .input-group input:not(.login-pin-box) {
            width: 100%;
            padding: 1rem; /* Reduced from 1.25rem */
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            font-size: 1rem; /* Reduced from 1.1rem */
            outline: none;
            transition: all 0.2s;
            background-color: #f9fafb;
            color: #111827;
        }

        .input-group input:not(.login-pin-box):focus {
            border-color: #0d5f68;
            background-color: white;
            box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.1);
        }

        .input-group input.error {
            border-color: #f87171;
            background-color: #fef2f2;
        }

        .field-error-text {
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            font-weight: 500;
        }

        .login-pin-container {
            display: flex;
            gap: 1.25rem;
            justify-content: space-between;
            width: 100%;
        }

        .login-pin-box {
            flex: 1;
            aspect-ratio: 1/1;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            text-align: center;
            font-size: 1.75rem;
            font-weight: 700;
            outline: none;
            transition: all 0.2s;
            background-color: #f9fafb;
            color: #111827;
            max-width: 85px;
        }

        .login-pin-box:focus {
            border-color: #0d5f68;
            background-color: white;
            box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.1);
        }

        .login-pin-box.error {
            border-color: #f87171;
            background-color: #fef2f2;
        }

        .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
            padding-bottom: 0.75rem; /* Reduced from 1.5rem */
            font-size: 0.95rem;
        }

        .forgot-password {
            color: #6b7280;
            text-decoration: none;
            font-weight: 600;
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: #6b7280;
            cursor: pointer;
            font-weight: 600;
        }

        .remember-me input {
            width: 1.2rem;
            height: 1.2rem;
            cursor: pointer;
            border-radius: 4px;
        }

        .sign-in-btn {
            width: 100%;
            padding: 1rem; /* Reduced from 1.25rem */
            background-color: #0d5f68;
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 1.15rem; /* Slightly smaller font */
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(13, 95, 104, 0.2);
        }

        .sign-in-btn:hover {
            background-color: #0a4b52;
            transform: translateY(-1px);
        }

        .sign-in-btn:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .login-footer {
            margin-top: 0.75rem; /* Further reduced */
            font-size: 0.813rem; /* Further reduced */
            color: #6b7280;
            text-align: center;
        }
        
        .login-footer a {
            color: #0d5f68;
            font-weight: 700;
            text-decoration: none;
        }
`}</style>
    </div>
  );
};

export default LoginForm;
