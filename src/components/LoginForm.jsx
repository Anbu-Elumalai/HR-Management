import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronDown } from 'lucide-react';
import api from '../api/api';
import MarsLogo from '../assets/MarsLogo.png';

const LoginForm = () => {
  // Country data with phone validation rules
  const countries = [
    { code: '+91', name: 'India', length: 10, flag: '🇮🇳' },
    { code: '+1', name: 'United States', length: 10, flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', length: 10, flag: '🇬🇧' },
    { code: '+61', name: 'Australia', length: 9, flag: '🇦🇺' },
    { code: '+81', name: 'Japan', length: 10, flag: '🇯🇵' },
    { code: '+86', name: 'China', length: 11, flag: '🇨🇳' },
    { code: '+33', name: 'France', length: 9, flag: '🇫🇷' },
    { code: '+49', name: 'Germany', length: 10, flag: '🇩🇪' },
    { code: '+39', name: 'Italy', length: 10, flag: '🇮🇹' },
    { code: '+34', name: 'Spain', length: 9, flag: '🇪🇸' },
  ];

  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to India
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ phone: '', pin: '' });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= selectedCountry.length) {
      setPhone(value);
      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setPhone(''); // Clear phone when country changes
    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
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
        countryCode: selectedCountry.code,
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
              <div className="country-selector-wrapper">
                <button 
                  type="button"
                  className="country-code-btn"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <span className="country-flag">{selectedCountry.flag}</span>
                  <span className="country-code-text">{selectedCountry.code}</span>
                  <ChevronDown size={16} className={`dropdown-icon ${showCountryDropdown ? 'open' : ''}`} />
                </button>
                
                {showCountryDropdown && (
                  <div className="country-dropdown">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        className={`country-option ${country.code === selectedCountry.code ? 'selected' : ''}`}
                        onClick={() => handleCountrySelect(country)}
                      >
                        <span className="country-flag">{country.flag}</span>
                        <span className="country-name">{country.name}</span>
                        <span className="country-code">{country.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder={`Enter ${selectedCountry.length}-digit phone number`}
                value={phone}
                onChange={handlePhoneChange}
                maxLength={selectedCountry.length}
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

        <div className="login-footer">
          <span>&copy; 2026 Mars Pvt Ltd. All rights reserved.</span>
        </div>
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
            height: 80px; /* Increased to 80px */
            width: auto;
            object-fit: contain;
            display: block;
            mix-blend-mode: multiply;
                position: relative;
    top: 25px;
        }
            color: #6b7280;
            font-size: 1rem;
            font-weight: 400;
            text-align: center;
            margin-bottom: 2rem; /* Increased specific spacing */
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
            gap: 0.75rem;
            align-items: stretch;
        }
        
        .country-selector-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .country-code-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            padding: 0.65rem 0.6rem;
            background-color: white;
            border: 1.5px solid #e5e7eb;
            border-radius: 8px;
            color: #4b5563;
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: fit-content;
            white-space: nowrap;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .country-code-btn:hover {
            background-color: #f9fafb;
            border-color: #d1d5db;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }
        
        .country-code-btn:active {
            background-color: #f3f4f6;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .country-flag {
            font-size: 1.2rem;
            line-height: 1;
        }
        
        .country-code-text {
            min-width: 2.5rem;
        }
        
        .dropdown-icon {
            transition: transform 0.3s ease;
            color: #9ca3af;
        }
        
        .dropdown-icon.open {
            transform: rotate(180deg);
        }
        
        .country-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
            width: max-content;
            margin-top: 0.5rem;
        }
        
        .country-option {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.75rem 1rem;
            background: white;
            border: none;
            text-align: left;
            cursor: pointer;
            transition: all 0.15s ease;
            min-width: 200px;
        }
        
        .country-option:hover {
            background-color: #f3f4f6;
        }
        
        .country-option.selected {
            background-color: #f0fdfa;
            border-left: 3px solid #0d5f68;
            padding-left: calc(1rem - 3px);
        }
        
        .country-option .country-flag {
            font-size: 1.5rem;
        }
        
        .country-option .country-name {
            flex: 1;
            font-weight: 500;
            color: #111827;
        }
        
        .country-option .country-code {
            font-weight: 600;
            color: #0d5f68;
            font-size: 0.9rem;
        }
        
        .phone-field {
            flex: 1;
            padding: 0.65rem 1rem;
            border: 1.5px solid #e5e7eb;
            border-radius: 8px;
            background-color: #f9fafb;
            font-size: 1rem;
            color: #111827;
            outline: none;
            font-weight: 500;
            letter-spacing: 0.3px;
            transition: all 0.2s ease;
        }
        
        .phone-field:focus {
            border-color: #0d5f68;
            background-color: white;
            box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.12);
        }
        
        .phone-field::placeholder {
            color: #9ca3af;
            font-weight: 400;
        }
        
        .phone-field.error {
            color: #ef4444;
            border-color: #fca5a5;
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
            height: 52px; /* Increased height for visual balance */
            border: 1.5px solid #d1d5db; /* Thicker 1.5px border */
            border-radius: 12px; /* Matches 12-16px radius request */
            text-align: center;
            font-size: 1.5rem;
            font-weight: 700;
            outline: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            background-color: #fff;
            color: #111827;
            max-width: 56px; /* Slightly wider */
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
            background-color: #0d5f68;
            color: white;
            border: none;
            border-radius: 12px; /* Consistent rounded corners */
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 6px -1px rgba(13, 95, 104, 0.2), 0 2px 4px -1px rgba(13, 95, 104, 0.1); /* Subtle elevation */
            margin-top: 1.75rem; /* Increased breathing room (28px) */
            display: flex;
            justify-content: center;
            align-items: center;
            letter-spacing: 0.3px;
        }

        .sign-in-btn:hover:not(:disabled) {
            background-color: #0b4e56; /* Darker teal */
            transform: translateY(-2px) scale(1.02); /* Lift and subtle scale */
            box-shadow: 0 12px 24px -6px rgba(13, 95, 104, 0.4), 0 6px 10px -4px rgba(13, 95, 104, 0.2);
        }

        .sign-in-btn:active:not(:disabled) {
            transform: translateY(0) scale(0.98); /* Press micro-animation */
            box-shadow: 0 2px 4px -1px rgba(13, 95, 104, 0.2);
        }

        .sign-in-btn:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
            box-shadow: none;
            opacity: 0.7;
        }

        .login-footer {
            margin-top: 3rem;
            font-size: 0.75rem;
            color: #9ca3af;
            text-align: center;
            border-top: 1px solid #f3f4f6;
            padding-top: 1.5rem;
            width: 100%;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
