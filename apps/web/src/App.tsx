// apps/web/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Intro / Landing
import Intro from './pages/auth/Intro';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PrakritiQuestionnaire from './pages/auth/PrakritiQuestionnaire';
// Removed: PhoneEntry, OTPVerify

// Dashboard Pages
import PatientDashboard from './pages/patient/Dashboard';
import AppointmentBooking from './pages/patient/AppointmentBooking';
import PatientNutrition from './pages/patient/Nutrition';
import PractitionerDashboard from './pages/practitioner/Dashboard';
import NutritionManagement from './pages/practitioner/NutritionManagement';
import AdminDashboard from './pages/admin/Dashboard';
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import { AdminLayout } from './components/admin/AdminLayout';
import StaffManagement from './pages/admin/StaffManagement';

// Admin Pages
import Patients from './pages/admin/Patients';
import Treatments from './pages/admin/Treatments';
import Reports from './pages/admin/Reports';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to /auth/login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // console.log('[ProtectedRoute] User:', user.id, 'Role:', user.role);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('[ProtectedRoute] Role mismatch. User:', user.role, 'Allowed:', allowedRoles);
    switch (user.role) {
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      case 'practitioner': return <Navigate to="/practitioner/dashboard" replace />;
      case 'receptionist': return <Navigate to="/receptionist/dashboard" replace />;
      case 'patient': return <Navigate to="/patient/dashboard" replace />;
      default: return <Navigate to="/auth/login" replace />;
    }
  }

  return <>{children}</>;
};



function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <LanguageProvider>
            <div className="min-h-screen">
              <Routes>
                {/* Intro / Landing Page (default) */}
                <Route path="/" element={<Intro />} />

                {/* New Auth Routes (Email/Password) */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/prakriti-questionnaire" element={<PrakritiQuestionnaire />} />

                {/* Redirect old phone routes to new login for safety */}
                <Route path="/auth/phone" element={<Navigate to="/auth/login" replace />} />
                <Route path="/auth/verify-otp" element={<Navigate to="/auth/login" replace />} />

                {/* Role-specific Routes */}
                <Route
                  path="/patient/*"
                  element={
                    <Routes>
                      <Route
                        path="dashboard"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <PatientDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="appointments/new"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <AppointmentBooking />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="nutrition"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <PatientNutrition />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  }
                />

                <Route
                  path="/practitioner/*"
                  element={
                    <ProtectedRoute allowedRoles={['practitioner']}>
                      <Routes>
                        <Route path="dashboard" element={<PractitionerDashboard />} />
                        <Route path="nutrition" element={<NutritionManagement />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/receptionist/*"
                  element={
                    <ProtectedRoute allowedRoles={['receptionist']}>
                      <Routes>
                        <Route path="dashboard" element={<ReceptionistDashboard />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="treatments" element={<Treatments />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Default fallback */}
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
              </Routes>
            </div>
          </LanguageProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;