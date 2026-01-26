import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users,
    Calendar,
    DollarSign,
    Briefcase,
    Shield,
    BarChart3,
    LayoutDashboard,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/app/employees', label: 'Employees', icon: Users },
        { path: '/app/attendance', label: 'Attendance', icon: Calendar },
        { path: '/app/payroll', label: 'Payroll', icon: DollarSign },
        { path: '/app/recruitment', label: 'Recruitment', icon: Briefcase },
        { path: '/app/roles', label: 'Roles & Permissions', icon: Shield },
        { path: '/app/reports', label: 'Reports', icon: BarChart3 },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">HR</div>
                <span className="logo-text">System</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            <style>{`
        .sidebar {
          width: 260px;
          background-color: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-main);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background-color: #f3f4f6;
          color: var(--primary-color);
        }

        .nav-item.active {
          background-color: #f0fdfa; /* Light teal bg */
          color: var(--primary-color);
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: none;
          color: #ef4444; /* Red for logout */
          font-weight: 500;
          transition: background 0.2s;
          text-align: left;
        }

        .logout-btn:hover {
          background-color: #fef2f2;
        }
      `}</style>
        </div>
    );
};

export default Sidebar;
