import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHomePath } from './RoleRoutes';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/');
  }

  function handleLinkClick() {
    setMenuOpen(false);
  }

  const logoDestination = user ? roleHomePath(user.role) : '/';

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to={logoDestination} className="navbar-logo" onClick={handleLinkClick}>
          <img src="/logo.png" alt="Anywhere Shuttles" />
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 4L20 20M20 4L4 20" stroke="#15181B" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="#15181B" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div className={'navbar-links' + (menuOpen ? ' open' : '')}>
          {user && user.role === 'PROVIDER' && <Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link>}
          {user && user.role === 'CUSTOMER' && <Link to="/my-bookings" onClick={handleLinkClick}>My bookings</Link>}
          {user && user.role === 'ADMIN' && <Link to="/admin" onClick={handleLinkClick}>Admin</Link>}
          {user && <Link to="/profile" onClick={handleLinkClick}>Profile</Link>}
          {user ? (
            <>
              <span className="navbar-user">{user.name} / {user.role}</span>
              <button onClick={handleLogout} className="navbar-cta" style={{ border: 'none', cursor: 'pointer' }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={handleLinkClick}>Log in</Link>
              <Link to="/signup" className="navbar-cta" onClick={handleLinkClick}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
