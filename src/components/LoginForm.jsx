import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import MarsLogo from '../assets/MarsLogo.png';

const LoginForm = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ phone: '', pin: '' });
  const navigate = useNavigate();

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
    } else if (phone.length !== selectedCountry.length) {
      newFieldErrors.phone = `Please enter a valid ${selectedCountry.length}-digit phone number`;
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
        countryCode: '+91',
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
        <div className="form-header-section">
          <div className="brand-logo-container fade-in">
            <img src={MarsLogo} alt="Mars Solutions Logo" className="brand-logo-image" />
          </div>
          <p className="welcome-sub">Sign in to your HR dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form-main">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <div className="phone-input-container">
              <div className="country-code-display">
                <span className="country-code-text">+91</span>
              </div>
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Only digits
                  if (val.length <= 10) {
                    setPhone(val);
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                  }
                }}
                maxLength={10}
                className={`phone-field ${fieldErrors.phone ? 'error' : ''}`}
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
      </div>

      <style>{`
        .login-form-container {
            flex: 1.1;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4rem 3rem 3rem 3rem; /* Increased top padding to 64px */
            position: relative;
        }

        .form-wrapper {
            width: 100%;
            max-width: 380px;
        }

        .form-header-section {
            text-align: center;
            margin-bottom: 2.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .brand-logo-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-bottom: 2rem; /* 32px spacing to subtitle */
            width: 100%;
            margin-top: 2.25rem; /* Moved further down */
        }

        .fade-in {
            animation: fadeIn 0.8s ease-out forwards;
            opacity: 0;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .brand-logo-image {
            height: 90px;
            width: auto;
            object-fit: contain;
            display: block;
        }

        .welcome-sub {
            color: #1f2937;
            font-size: 1.125rem;
            font-weight: 500;
            text-align: center;
            margin-bottom: 0.5rem;
        }

        .login-form-main {
            display: flex;
            flex-direction: column;
            gap: 2rem; /* Increased to 32px (+4px breathing room) */
        }

        .error-message {
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            text-align: center;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem; /* 12px spacing between label and input */
        }

        .input-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
            margin-left: 2px;
        }
        
        .phone-input-container {
            display: flex;
            align-items: stretch;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background-color: white;
            transition: all 0.2s ease;
            overflow: hidden;
        }
        
        .phone-input-container:focus-within {
            border-color: #0d5f68;
            box-shadow: 0 0 0 2px rgba(13, 95, 104, 0.1);
        }
        
        .country-code-display {
            background-color: #f3f4f6;
            padding: 0 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-right: 1px solid #e5e7eb;
            color: #4b5563;
            font-weight: 600;
            font-size: 1rem;
        }
        
        .phone-field {
            flex: 1;
            padding: 0.875rem 1rem;
            border: none;
            background-color: transparent;
            font-size: 1rem;
            color: #111827;
            outline: none;
            font-weight: 500;
        }
        
        .phone-field::placeholder {
            color: #9ca3af;
            font-weight: 400;
        }
        
        .phone-field.error {
            color: #ef4444;
            background-color: #fef2f2;
        }

        .field-error-text {
            color: #dc2626;
            font-size: 0.75rem;
            font-weight: 500;
            margin-left: 2px;
        }

        .login-pin-container {
            display: flex;
            gap: 0.75rem;
            justify-content: space-between;
            /* margin-top removed for consistent spacing */
        }

        .login-pin-box {
            flex: 1;
            width: 100%;
            height: 64px;
            border: 1.5px solid #d1d5db;
            border-radius: 16px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 700;
            outline: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            background-color: #fff;
            color: #111827;
            max-width: 64px;
        }

        .login-pin-box:focus {
            border-color: #0d5f68;
            background-color: white;
            box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.15); /* Soft teal glow */
            transform: translateY(-1px) scale(1.02); /* Micro scale on focus */
        }

        .login-pin-box.error {
            border-color: #fca5a5;
            background-color: #fef2f2;
        }

        .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.875rem;
            margin-top: 1.25rem; /* Reduced slightly (20px) */
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #4b5563;
            cursor: pointer;
            font-weight: 500;
            transition: color 0.15s ease;
        }
        
        .remember-me:hover {
            color: #111827;
        }

        .remember-me input {
            width: 1rem;
            height: 1rem;
            border-radius: 4px;
            accent-color: #0d5f68;
            cursor: pointer;
            border: 1px solid #d1d5db;
        }

        .forgot-password {
            color: #0d5f68;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.15s ease;
        }
        
        .forgot-password:hover {
            color: #0f7682;
            text-decoration: underline;
        }

        .sign-in-btn {
            width: 100%;
            padding: 0.875rem;
            background-color: #115e59;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin-top: 1.75rem;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .sign-in-btn:hover:not(:disabled) {
            background-color: #0f4c48;
        }

        .sign-in-btn:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
        }

        .sign-in-btn:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
            opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
