import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
          </button>
          <div className="user-profile" onClick={() => navigate('/app/profile')} style={{ cursor: 'pointer' }}>
            <div className="avatar">A</div>
            <span className="font-medium">Admin User</span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .dashboard-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f4c54 0%, #1a2e35 100%);
          color: white; /* Determine default text color to be light */
        }

        .main-content {
          margin-left: 260px; /* Width of sidebar */
          width: calc(100% - 260px);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        .topbar {
          height: 60px; /* Reduced height */
          background: #0f4c54;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 40;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          margin-right: auto;
          padding: 0.5rem;
          border-radius: 4px;
        }
        
        .menu-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
          .menu-btn {
            display: block;
          }
          .topbar {
            padding: 0 1rem;
          }
        }

        .breadcrumbs {
          display: flex;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        
        /* Update breadcrumbs colors for dark mode */
        .breadcrumbs span.text-gray-500 { color: rgba(255, 255, 255, 0.6) !important; }
        .breadcrumbs span.text-gray-300 { color: rgba(255, 255, 255, 0.4) !important; }
        .breadcrumbs span.text-gray-800 { color: white !important; }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem; /* More spacing */
          transition: all 0.2s;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .user-profile:hover {
          background: rgba(255, 255, 255, 0.15); /* Improved hover */
        }

        .avatar {
          width: 32px;
          height: 32px;
          background-color: var(--primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .page-content {
          width: 100%;
          padding: 0;
          /* Pages handle their own padding or we can set it here */
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
