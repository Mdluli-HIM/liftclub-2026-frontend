import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function roleHomePath(role) {
  if (role === 'PROVIDER') return '/dashboard';
  if (role === 'ADMIN') return '/admin';
  return '/';
}

// Blocks logged-in providers/admins from customer-facing pages (search, trip detail, bookings).
// Anonymous visitors are still allowed through - public browsing stays open.
export function CustomerOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user && user.role !== 'CUSTOMER') {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }
  return children;
}

// Blocks logged-in customers/admins from the provider dashboard.
// Not-logged-in visitors still see the page's own "please log in" prompt.
export function ProviderOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user && user.role !== 'PROVIDER') {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }
  return children;
}

// Blocks logged-in customers/providers from the admin panel.
export function AdminOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user && user.role !== 'ADMIN') {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }
  return children;
}
