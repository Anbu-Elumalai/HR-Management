import React from 'react';
import LoginHero from '../components/LoginHero';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-card-wrapper">
        <LoginHero />
        <LoginForm />
      </div>

      <style>{`
        .login-page {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0F5F5C 0%, #083C3A 100%);
          position: relative;
        }
        
        /* Subtle background noise/blur effect */
        .login-page::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 60%);
            backdrop-filter: blur(20px); /* Subtle blur feel */
            pointer-events: none;
        }

        .login-card-wrapper {
          width: 90%;
          max-width: 1000px;
          height: 72vh;
          min-height: 500px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          box-shadow: 0 45px 120px rgba(0, 0, 0, 0.15); /* Strong soft shadow */
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); /* Smooth entrance */
          z-index: 10;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
          .login-card-wrapper {
            flex-direction: column;
            width: 100%;
            max-width: 100%;
            height: 100vh;
            min-height: 100vh;
            border-radius: 0;
            box-shadow: none;
          }
          
          .login-hero {
            display: none; /* Hide hero on small mobile, or adjust height */
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
