import React from 'react';
import LoginHero from '../components/LoginHero';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-card">
        <LoginHero />
        <LoginForm />
      </div>

      <style>{`
        .login-page {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #2a4e4c 0%, #2F5553 55%, #243d3c 100%);
          padding: 2rem;
          overflow: hidden;
        }

        .login-card {
          width: 100%;
          max-width: 1020px;
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38);
          animation: fadeUp 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
          .login-page { padding: 0; }
          .login-card { flex-direction: column; border-radius: 0; height: 100vh; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
