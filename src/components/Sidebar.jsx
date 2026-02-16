import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  Shield,
  BarChart3,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ChevronRight,
  Circle,
  Settings,
  Users2,
  Lock
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [activeMenuPath, setActiveMenuPath] = useState(null);

  const menuItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      path: '/app/hr',
      label: 'HR',
      icon: Users,
      children: [
        { path: '/app/hr/employees', label: 'Employees' },
        { path: '/app/hr/attendance', label: 'Attendance' },
        { path: '/app/hr/payroll', label: 'Payroll' },
      ]
    },
    {
      path: '/app/recruitment',
      label: 'Recruitment',
      icon: Briefcase,
      children: [
        { path: '/app/recruitment/vacancy', label: 'Vacancy' },
        { path: '/app/recruitment/candidate', label: 'Candidates' },
        { path: '/app/recruitment/interview', label: 'Interview' },
        { path: '/app/recruitment/offer', label: 'Offers' },
      ]
    },
    { path: '/app/reports', label: 'Reports', icon: BarChart3 },
    {
      path: '/app/administration',
      label: 'Administration',
      icon: Lock,
      children: [
        { path: '/app/administration/users', label: 'Users' },
        { path: '/app/administration/roles', label: 'Roles & Permissions' },
      ]
    },
    {
      path: '/app/settings',
      label: 'Settings',
      icon: Settings,
      children: [
        { path: '/app/settings/master-data', label: 'Master Data' },
      ]
    },
  ];

  useEffect(() => {
    // Auto-expand menu if current path is a child
    const activeParent = menuItems.find(item =>
      item.children && item.children.some(child => location.pathname.startsWith(child.path))
    );
    if (activeParent) {
      setActiveMenuPath(activeParent.path);
    } else {
      // If navigating to a top-level item without children, close all accordions
      setActiveMenuPath(null);
    }
  }, [location.pathname]);

  const toggleMenu = (path) => {
    setActiveMenuPath(prevPath => prevPath === path ? null : path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">HR</div>
        <span className="logo-text">System</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (item.children) {
            const isExpanded = activeMenuPath === item.path;
            const isActiveParent = item.children.some(child => location.pathname.startsWith(child.path));

            return (
              <div key={item.path} className="nav-group">
                <div
                  className={`nav-item parent ${isActiveParent ? 'active-parent' : ''}`}
                  onClick={() => toggleMenu(item.path)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {isExpanded && (
                  <div className="nav-children">
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) => `nav-child-item ${isActive ? 'active' : ''}`}
                      >
                        <Circle size={8} fill="currentColor" />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
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
          z-index: 50;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .logo-icon {
            background: linear-gradient(135deg, #0f4c54 0%, #0a383e 100%);
            color: white;
            font-weight: bold;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          color: #1f2937;
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
          justify-content: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: #6b7280;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .nav-item > div {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
        }

        .nav-item:hover {
          background-color: #f3f4f6;
          color: #0f4c54;
        }

        .nav-item.active, .nav-item.active-parent {
          background-color: rgba(13, 95, 104, 0.08); /* Subtle teal with opacity */
          color: #0d5f68;
          font-weight: 600;
        }
        
        .nav-children {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            margin-top: 0.25rem;
            margin-left: 1rem;
            padding-left: 1rem;
            border-left: 1px solid #e5e7eb;
        }
        
        .nav-child-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            color: #6b7280;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .nav-child-item:hover {
            color: #0f4c54;
            background-color: #f9fafb;
        }
        
        .nav-child-item.active {
            color: #ef4444; /* As per screenshot red dot */
            font-weight: 600;
        }
        
        .nav-child-item.active svg {
            fill: #ef4444;
            color: #ef4444;
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
          border: none;
          cursor: pointer;
        }

        .logout-btn:hover {
          background-color: #fef2f2;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
