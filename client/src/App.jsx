import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ReceptionistDashboardPage from './pages/ReceptionistDashboardPage';
import ReceptionistQueuePage from './pages/ReceptionistQueuePage';
import ReceptionistAppointmentsPage from './pages/ReceptionistAppointmentsPage';
import PharmacyPage from './pages/PharmacyPage';
import DoctorOverviewPage from './pages/DoctorOverviewPage';
import DoctorQueuePage from './pages/DoctorQueuePage';
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage';
import DoctorRecordsPage from './pages/DoctorRecordsPage';
import DoctorDiagnosesPage from './pages/DoctorDiagnosesPage';
import DoctorOpticalPage from './pages/DoctorOpticalPage';
import OpticalDashboardPage from './pages/OpticalDashboardPage';
import OpticalPatientsPage from './pages/OpticalPatientsPage';
import PharmacySalesHistoryPage from './pages/PharmacySalesHistoryPage';
import PatientDetailPage from './pages/PatientDetailPage';
import NotFoundPage from './pages/NotFoundPage';

const HOME_BY_ROLE = {
  receptionist: '/receptionist',
  doctor: '/doctor',
  optical: '/optical',
};

function Root() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <HomePage />;
  return <Navigate to={HOME_BY_ROLE[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Root />} />
          <Route
            path="/receptionist"
            element={
              <ProtectedRoute role="receptionist">
                <ReceptionistDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/queue"
            element={
              <ProtectedRoute role="receptionist">
                <ReceptionistQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/appointments"
            element={
              <ProtectedRoute role="receptionist">
                <ReceptionistAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/pharmacy"
            element={
              <ProtectedRoute role="receptionist">
                <PharmacyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute role="doctor">
                <DoctorOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/queue"
            element={
              <ProtectedRoute role="doctor">
                <DoctorQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute role="doctor">
                <DoctorAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/records"
            element={
              <ProtectedRoute role="doctor">
                <DoctorRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/diagnoses"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDiagnosesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/optical"
            element={
              <ProtectedRoute role="doctor">
                <DoctorOpticalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/pharmacy"
            element={
              <ProtectedRoute role="doctor">
                <PharmacyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/history"
            element={
              <ProtectedRoute role="doctor">
                <PharmacySalesHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/optical"
            element={
              <ProtectedRoute role="optical">
                <OpticalDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/optical/patients"
            element={
              <ProtectedRoute role="optical">
                <OpticalPatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
