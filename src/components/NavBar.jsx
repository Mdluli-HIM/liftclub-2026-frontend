import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-dot" />
          RIDEBOOKER
        </Link>
        <div className="navbar-links">
          {user && user.role === 'PROVIDER' && <Link to="/dashboard">Dashboard</Link>}
          {user && user.role === 'CUSTOMER' && <Link to="/my-bookings">My bookings</Link>}
          {user && user.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
          {user ? (
            <>
              <span className="navbar-user">{user.name} / {user.role}</span>
              <button onClick={handleLogout} className="navbar-cta" style={{ border: 'none', cursor: 'pointer' }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="navbar-cta">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
