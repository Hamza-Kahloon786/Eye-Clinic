import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const HOME_BY_ROLE = {
  receptionist: '/receptionist',
  doctor: '/doctor',
  optical: '/optical',
};

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={HOME_BY_ROLE[user.role] || '/login'} replace />;
  }

  return children;
}
