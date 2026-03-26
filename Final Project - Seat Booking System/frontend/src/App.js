import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import './styles/global.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import BrowsePage from './pages/user/BrowsePage';
import EventDetailPage from './pages/user/EventDetailPage';
import BookingPage from './pages/user/BookingPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import NotificationsPage from './pages/user/NotificationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminSlotsPage from './pages/admin/AdminSlotsPage';
import AdminSeatsPage from './pages/admin/AdminSeatsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import ForgotPassword from './pages/ForgotPassword';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import UserProfilePage from './pages/user/UserProfilePage';


const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (!requireAdmin && isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, isAdmin } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={isAdmin ? '/admin' : '/'} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={isAdmin ? '/admin' : '/'} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User routes */}
        <Route path="/" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
        <Route path="/book/:slotId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute requireAdmin><AdminEventsPage /></ProtectedRoute>} />
        <Route path="/admin/slots" element={<ProtectedRoute requireAdmin><AdminSlotsPage /></ProtectedRoute>} />
        <Route path="/admin/seats" element={<ProtectedRoute requireAdmin><AdminSeatsPage /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute requireAdmin><AdminBookingsPage /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><AdminPaymentsPage /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute requireAdmin><AdminReviewsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? (isAdmin ? '/admin' : '/') : '/login'} />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#18140f',
              border: '1px solid #e6e2da',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00d68f', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#e8305a', secondary: '#ffffff' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
