import React from 'react';
import loginHeroImage from '../assets/login_hero.png';

const LoginHero = () => {
  return (
    <div className="login-hero">
      <img src={loginHeroImage} alt="Office" className="hero-image" />
      <div className="hero-overlay">
        <h1>Empowering<br />Your<br />Workday.</h1>
        <p className="hero-subtitle">Manage employees, payroll, and<br />performance seamlessly.</p>
      </div>
      <style>{`
        .login-hero {
          flex: 0 0 46%;
          position: relative;
          overflow: hidden;
          min-height: 480px;
          border-radius: 16px;
          margin: 14px 0 14px 14px;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg,
            rgba(27, 123, 125, 0.52) 0%,
            rgba(20, 90, 88, 0.88) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-start;
          padding: 2.5rem;
        }

        .hero-overlay h1 {
          color: #ffffff;
          font-size: 2.4rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 0.875rem;
          letter-spacing: -0.3px;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        .hero-subtitle {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.875rem;
          line-height: 1.65;
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .login-hero { display: none; }
        }
      `}</style>
    </div>
  );
};

export default LoginHero;
