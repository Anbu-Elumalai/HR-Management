import React from 'react';
import loginHeroImage from '../assets/login_hero.png';

const LoginHero = () => {
  return (
    <div className="login-hero">
      <div className="hero-content">
        <img src={loginHeroImage} alt="Empowering Your Workday" className="hero-image" />
        <div className="hero-overlay">
          <h1>Empowering Your Workday.</h1>
        </div>
      </div>
      <style>{`
        .login-hero {
          flex: 1;
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
          top: 20%;
          left: 0;
          width: 100%;
          text-align: center;
          padding: 0 2rem;
        }

        .hero-overlay h1 {
          color: white;
          font-size: 2.5rem;
          font-weight: 500;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          letter-spacing: 0.5px;
          font-family: serif; /* Matches the serif font in the reference */
        }
      `}</style>
    </div>
  );
};

export default LoginHero;
