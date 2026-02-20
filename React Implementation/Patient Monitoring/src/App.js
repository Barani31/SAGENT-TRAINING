import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import HealthData from './pages/HealthData';
import DailyReadings from './pages/DailyReadings';
import Consultations from './pages/Consultations';
import Messages from './pages/Messages';
import Reports from './pages/Reports';

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
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/health-data" element={<HealthData />} />
                <Route path="/readings" element={<DailyReadings />} />
                <Route path="/consultations" element={<Consultations />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/reports" element={<Reports />} />
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