import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MemberDashboard from './pages/MemberDashboard';
import BrowseBooks from './pages/BrowseBooks';
import MyBorrows from './pages/MyBorrows';
import MyFines from './pages/MyFines';
import Notifications from './pages/Notifications';
import LibrarianDashboard from './pages/LibrarianDashboard';
import ManageBooks from './pages/ManageBooks';
import ManageFines from './pages/ManageFines';
import ManageMembers from './pages/ManageMembers';

export default function App() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!user) return <Login />;

  const isLibrarian = user.role === 'librarian';

  const memberNav = [
    { id: 'dashboard', label: 'Dashboard',    icon: '🏠' },
    { id: 'browse',    label: 'Browse Books',  icon: '🔍' },
    { id: 'borrows',   label: 'My Borrows',    icon: '📖' },
    { id: 'fines',     label: 'My Fines',      icon: '💰' },
    { id: 'notifs',    label: 'Notifications', icon: '🔔' },
  ];

  const librarianNav = [
    { id: 'dashboard', label: 'Dashboard',     icon: '🏠' },
    { id: 'books',     label: 'Manage Books',  icon: '📚' },
    { id: 'fines',     label: 'Manage Fines',  icon: '💰' },
    { id: 'members',   label: 'Members',       icon: '👥' },
    { id: 'notifs',    label: 'Notifications', icon: '🔔' },
  ];

  const nav = isLibrarian ? librarianNav : memberNav;

  const renderPage = () => {
    if (isLibrarian) {
      if (page === 'dashboard') return <LibrarianDashboard />;
      if (page === 'books')     return <ManageBooks />;
      if (page === 'fines')     return <ManageFines />;
      if (page === 'members')   return <ManageMembers />;
      if (page === 'notifs')    return <Notifications />;
    } else {
      if (page === 'dashboard') return <MemberDashboard />;
      if (page === 'browse')    return <BrowseBooks />;
      if (page === 'borrows')   return <MyBorrows />;
      if (page === 'fines')     return <MyFines />;
      if (page === 'notifs')    return <Notifications />;
    }
    return null;
  };

  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">📚</div>
          <div className="logo-text">Library System</div>
          <div className="logo-sub">{isLibrarian ? 'Librarian Portal' : 'Member Portal'}</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">
            {isLibrarian ? 'Librarian Menu' : `${user.category || 'Member'} Menu`}
          </div>
          {nav.map(item => (
            <button key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="uname">{user.name}</div>
              <div className="urole">
                {isLibrarian ? 'Librarian' : `${user.category || 'Member'} · #${user.memId}`}
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); setPage('dashboard'); }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
