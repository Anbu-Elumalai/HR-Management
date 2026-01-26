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
          background-color: var(--primary-color); /* Dark background behind card as seen in image edges */
          background: linear-gradient(135deg, #0f4c54 0%, #1a2e35 100%);
        }

        .login-card-wrapper {
          width: 90%;
          max-width: 1200px;
          height: 80vh; /* Fixed height for the card look */
          min-height: 600px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @media (max-width: 768px) {
          .login-card-wrapper {
            flex-direction: column;
            height: auto;
            min-height: auto;
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
