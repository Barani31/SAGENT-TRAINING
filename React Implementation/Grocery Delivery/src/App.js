import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/"              element={<Dashboard />} />
                <Route path="/products"      element={<Products />} />
                <Route path="/cart"          element={<Cart />} />
                <Route path="/orders"        element={<Orders />} />
                <Route path="/payments"      element={<Payments />} />
                <Route path="/notifications" element={<Notifications />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
