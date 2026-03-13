import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Projects from './pages/Projects';

// Recruitment Sub-modules
import Vacancy from './pages/recruitment/Vacancy';
import Candidate from './pages/recruitment/Candidate';
import Interview from './pages/recruitment/Interview';
import Offer from './pages/recruitment/Offer';

import Roles from './pages/Roles';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Dashboard Routes */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          {/* HR Management */}
          <Route path="hr/employees" element={<Employees />} />
          <Route path="hr/attendance" element={<Attendance />} />
          <Route path="hr/payroll" element={<Payroll />} />
          <Route path="projects" element={<Projects />} />

          {/* Recruitment */}
          {/* Recruitment with Sub-modules */}
          <Route path="recruitment" element={<Navigate to="vacancy" replace />} />
          <Route path="recruitment/vacancy" element={<Vacancy />} />
          <Route path="recruitment/candidate" element={<Candidate />} />
          <Route path="recruitment/interview" element={<Interview />} />
          <Route path="recruitment/offer" element={<Offer />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />

          {/* Administration */}
          <Route path="administration/users" element={<Settings />} />
          <Route path="administration/roles" element={<Roles />} />

          {/* Settings / Master Data */}
          <Route path="settings/:tab?" element={<Settings />} />

          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
