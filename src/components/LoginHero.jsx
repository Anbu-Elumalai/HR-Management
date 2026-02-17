import React from 'react';
import loginHeroImage from '../assets/login_hero.png';

const LoginHero = () => {
  return (
    <div className="login-hero">
      <div className="hero-content">
        <img src={loginHeroImage} alt="Empowering Your Workday" className="hero-image" />
        <div className="hero-overlay">
          <h1>Empowering Your Workday.</h1>
          <p className="hero-subtitle">Manage employees, payroll, and performance seamlessly.</p>
        </div>
      </div>
      <style>{`
        .login-hero {
          flex: 0.9;
          position: relative;
          overflow: hidden;
          background-color: #0d5f68; /* Fallback */
          display: flex;
        }
        
        .hero-content {
          width: 100%;
          height: 100%;
          position: relative;
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
          background: linear-gradient(to bottom, rgba(13, 95, 104, 0.6) 0%, rgba(13, 95, 104, 0.95) 100%); /* Improved contrast */
          display: flex;
          flex-direction: column;
          justify-content: center; /* Center-aligned for balance */
          align-items: flex-start;
          padding: 4rem;
          text-align: left;
        }

        .hero-overlay h1 {
          color: white;
          font-size: 3rem; /* Slightly larger heading */
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -1.5px;
          line-height: 1.1;
          text-shadow: 0 4px 12px rgba(0,0,0,0.2);
          font-family: 'Inter', sans-serif;
        }
        
        .hero-subtitle {
            color: rgba(255, 255, 255, 0.95);
            font-size: 1.125rem;
            line-height: 1.6;
            max-width: 420px;
            font-weight: 400;
        }
            font-size: 1.125rem;
            font-weight: 400;
            max-width: 90%;
            line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default LoginHero;
