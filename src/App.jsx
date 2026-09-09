// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { ToastProvider } from './context/ToastContext';
import Landing     from './pages/Landing';
import Auth        from './pages/Auth';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard   from './pages/Dashboard';
import AdminUsers  from './pages/AdminUsers';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading EcoTrack…</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading EcoTrack…</p>
      </div>
    </div>
  );
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                element={<Landing />} />
      <Route path="/auth"            element={<GuestRoute><Auth /></GuestRoute>} />
      <Route path="/verify-email"    element={<GuestRoute><VerifyEmail /></GuestRoute>} />
      <Route path="/dashboard/*"     element={
        <PrivateRoute>
          <CompanyProvider>
            <Dashboard />
          </CompanyProvider>
        </PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
