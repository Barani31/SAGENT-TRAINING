import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ApplyNow from './pages/ApplyNow';
import MyApplications from './pages/MyApplications';
import OfficerDashboard from './pages/OfficerDashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Payments from './pages/Payments';

export default function App() {
  const { user, logout } = useAuth();
  const [page, setPage] = React.useState('dashboard');

  // Reset to dashboard whenever user logs in
  React.useEffect(() => {
    if (user) setPage('dashboard');
  }, [user]);

  if (!user) return <Login />;

  const isStudent = user.role === 'student';
  const isOfficer = user.role === 'officer';

  const studentNav = [
    { id: 'dashboard',    label: 'Dashboard',      icon: '🏠' },
    { id: 'apply',        label: 'Apply Now',       icon: '✏️' },
    { id: 'applications', label: 'My Applications', icon: '📋' },
    { id: 'courses',      label: 'Browse Courses',  icon: '📚' },
    { id: 'payments',     label: 'Payments',        icon: '💳' },
  ];

  const officerNav = [
    { id: 'dashboard',    label: 'Dashboard',      icon: '🏠' },
    { id: 'applications', label: 'Applications',   icon: '📋' },
    { id: 'students',     label: 'Students',       icon: '👥' },
    { id: 'courses',      label: 'Manage Courses', icon: '📚' },
    { id: 'payments',     label: 'Payments',       icon: '💳' },
  ];

  const nav = isStudent ? studentNav : officerNav;

  const renderPage = () => {
    if (isStudent) {
      if (page === 'dashboard')    return <StudentDashboard />;
      if (page === 'apply')        return <ApplyNow />;
      if (page === 'applications') return <MyApplications />;
      if (page === 'courses')      return <Courses />;
      if (page === 'payments')     return <Payments />;
    }
    if (isOfficer) {
      if (page === 'dashboard')    return <OfficerDashboard />;
if (page === 'applications') return <OfficerDashboard showOnlyApplications />;      if (page === 'students')     return <Students />;
      if (page === 'courses')      return <Courses />;
      if (page === 'payments')     return <Payments />;
    }
    return <OfficerDashboard />;
  };

  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">EduApply</div>
          <div className="logo-sub">Admissions Portal</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">
            {isStudent ? 'Student Menu' : 'Officer Menu'}
          </div>
          {nav.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="name">{user.name}</div>
              <div className="role">{user.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}