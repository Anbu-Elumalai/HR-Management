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
    if (value !== '' && index < 3) {
      const next = document.getElementById(`pin-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const newFieldErrors = { phone: '', pin: '' };
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
      newFieldErrors.pin = 'Please enter your 4-digit PIN';
      hasError = true;
    }

    if (hasError) { setFieldErrors(newFieldErrors); return; }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        phoneNumber: phone,
        countryCode: '+91',
        pin: pinValue,
      });
      const result = response.data;
      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('userType', result.data.userType);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        navigate('/app/dashboard');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lf-outer">
      <div className="lf-inner">

        {/* ── Logo ── */}
        <div className="lf-logo-row">
          <img src={MarsLogo} alt="Mars Solutions" className="lf-logo" />
        </div>
        <p className="lf-subtitle">Sign in to your HR dashboard</p>

        {error && <div className="lf-error">{error}</div>}

        <form onSubmit={handleLogin} className="lf-form">

          {/* Phone */}
          <div className="lf-group">
            <label className="lf-label">Phone Number</label>
            <div className={`lf-phone-wrap ${fieldErrors.phone ? 'lf-err-border' : ''}`}>
              <span className="lf-cc">+91</span>
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phone}
                maxLength={10}
                className="lf-phone-input"
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  if (v.length <= 10) {
                    setPhone(v);
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                  }
                }}
              />
            </div>
            {fieldErrors.phone && <span className="lf-field-err">{fieldErrors.phone}</span>}
          </div>

          {/* PIN */}
          <div className="lf-group">
            <label className="lf-label">4-digit PIN</label>
            <div className="lf-pin-row">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="password"
                  maxLength="1"
                  value={digit}
                  className={`lf-pin-box ${fieldErrors.pin ? 'lf-pin-err' : ''}`}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && idx > 0)
                      document.getElementById(`pin-${idx - 1}`).focus();
                  }}
                />
              ))}
            </div>
            {fieldErrors.pin && <span className="lf-field-err">{fieldErrors.pin}</span>}
          </div>

          {/* Remember / Forgot */}
          <div className="lf-actions-row">
            <label className="lf-remember">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <a href="#" className="lf-forgot">Forgot Password?</a>
          </div>

          {/* Submit */}
          <button type="submit" className="lf-submit" disabled={loading}>
            {loading ? 'Signing In…' : 'Sign In'}
          </button>

        </form>
      </div>

      <style>{`
        /* ── Outer panel fills remaining card width ── */
        .lf-outer {
          flex: 1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 3rem;
        }

        /* ── Inner content block, max width ── */
        .lf-inner {
          width: 100%;
          max-width: 400px;
        }

        /* ── Logo ── */
        .lf-logo-row {
          margin-bottom: 0.6rem;
        }

        .lf-logo {
          height: 52px;      /* fits the compact row in the reference */
          width: auto;
          display: block;
          object-fit: contain;
        }

        /* ── Subtitle ── */
        .lf-subtitle {
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 400;
          margin-bottom: 2rem;
        }

        /* ── Error banner ── */
        .lf-error {
          background: #fee2e2;
          color: #b91c1c;
          padding: 0.65rem 0.875rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        /* ── Form ── */
        .lf-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .lf-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .lf-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
        }

        /* Phone */
        .lf-phone-wrap {
          display: flex;
          align-items: stretch;
          border: 1.5px solid #D7DDE2;
          border-radius: 10px;
          overflow: hidden;
          background: #F1F3F5;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .lf-phone-wrap:focus-within {
          border-color: #2E7A78;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(46, 122, 120, 0.12);
        }
        .lf-phone-wrap.lf-err-border { border-color: #fca5a5; }

        .lf-cc {
          padding: 0 0.85rem;
          background: #E4E8EC;
          border-right: 1.5px solid #D7DDE2;
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4b5563;
          flex-shrink: 0;
        }

        .lf-phone-input {
          flex: 1;
          padding: 0.72rem 0.9rem;
          border: none;
          background: transparent;
          font-size: 0.9rem;
          color: #111827;
          outline: none;
        }
        .lf-phone-input::placeholder { color: #9ca3af; }

        /* PIN */
        .lf-pin-row {
          display: flex;
          gap: 0.65rem;
        }

        .lf-pin-box {
          flex: 1;
          height: 54px;
          max-width: 80px;
          border: 1.5px solid #D7DDE2;
          border-radius: 12px;
          background: #F1F3F5;
          text-align: center;
          font-size: 1.4rem;
          font-weight: 700;
          color: #111827;
          outline: none;
          transition: all 0.18s ease;
        }
        .lf-pin-box:focus {
          border-color: #2E7A78;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(46, 122, 120, 0.12);
          transform: translateY(-1px) scale(1.03);
        }
        .lf-pin-box.lf-pin-err { border-color: #fca5a5; background: #fef2f2; }

        /* Field err */
        .lf-field-err {
          color: #dc2626;
          font-size: 0.72rem;
          font-weight: 500;
        }

        /* Actions row */
        .lf-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          margin-top: 0.1rem;
        }

        .lf-remember {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: #4b5563;
          cursor: pointer;
          font-weight: 500;
          user-select: none;
        }
        .lf-remember input {
          accent-color: #2D7B78;
          width: 0.95rem;
          height: 0.95rem;
        }

        .lf-forgot {
          color: #2E7A78;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.82rem;
          transition: color 0.15s;
        }
        .lf-forgot:hover { color: #245f5d; text-decoration: underline; }

        /* Submit */
        .lf-submit {
          width: 100%;
          padding: 0.82rem;
          background: #2D7B78;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: background 0.22s, transform 0.15s, box-shadow 0.22s;
          margin-top: 0.25rem;
        }
        .lf-submit:hover:not(:disabled) {
          background: #245f5d;
          box-shadow: 0 4px 18px rgba(46, 122, 120, 0.3);
          transform: translateY(-1px);
        }
        .lf-submit:active:not(:disabled) { transform: translateY(0); }
        .lf-submit:disabled { background: #9ca3af; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default LoginForm;
