import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await signup({ name, email, phone, password, role });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400, paddingTop: 56 }}>
      <p className="eyebrow">Join the platform</p>
      <h1 style={{ fontSize: 36, marginBottom: 24 }}>SIGN UP</h1>
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
            />
          </div>
          <div className="field">
            <label>Phone (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Password (min 6 characters)</label>
            <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label>I am a</label>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                <input type="radio" name="role" value="CUSTOMER" checked={role === 'CUSTOMER'} onChange={(e) => setRole(e.target.value)} style={{ width: 'auto' }} />
                Rider
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                <input type="radio" name="role" value="PROVIDER" checked={role === 'PROVIDER'} onChange={(e) => setRole(e.target.value)} style={{ width: 'auto' }} />
                Driver / Provider
              </label>
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary">Sign up</button>
        </form>
      </div>
      <p style={{ marginTop: 16, fontSize: 14 }}>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}

export default Signup;
