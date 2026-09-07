import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TripDetail from './pages/TripDetail';
import ProviderDashboard from './pages/ProviderDashboard';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import SearchResults from './pages/SearchResults';
import TripPassengers from './pages/TripPassengers';
import Profile from './pages/Profile';
import { CustomerOnlyRoute, ProviderOnlyRoute, AdminOnlyRoute } from './components/RoleRoutes';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<CustomerOnlyRoute><Home /></CustomerOnlyRoute>} />
        <Route path="/search" element={<CustomerOnlyRoute><SearchResults /></CustomerOnlyRoute>} />
        <Route path="/trips/:id" element={<CustomerOnlyRoute><TripDetail /></CustomerOnlyRoute>} />
        <Route path="/my-bookings" element={<CustomerOnlyRoute><MyBookings /></CustomerOnlyRoute>} />

        <Route path="/dashboard" element={<ProviderOnlyRoute><ProviderDashboard /></ProviderOnlyRoute>} />
        <Route path="/dashboard/trips/:id/passengers" element={<ProviderOnlyRoute><TripPassengers /></ProviderOnlyRoute>} />

        <Route path="/admin" element={<AdminOnlyRoute><AdminDashboard /></AdminOnlyRoute>} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
