import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  const location = useLocation();

  // Get current page name from path (e.g. /app/employees -> Employees)
  // Default to 'Dashboard' if strictly at /app/dashboard
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path || path === 'dashboard') return 'Dashboard';
    // Capitalize first letter
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div className="user-profile">
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
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .topbar {
          height: 64px;
          background: #0f4c54; /* Solid color matching gradient start */
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: flex-end; /* Align user profile to the right */
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
          gap: 0.75rem;
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
          padding: 0; 
          /* Pages handle their own padding or we can set it here */
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
