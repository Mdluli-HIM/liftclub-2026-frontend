import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProviders, approveProvider, getAllBookings } from '../api/admin';

import { API_BASE_URL as API_ORIGIN } from '../api/config';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    if (user && user.role === 'ADMIN') loadData();
    else setLoading(false);
  }, [user]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [providersData, bookingsData] = await Promise.all([getProviders(), getAllBookings()]);
      setProviders(providersData.providers);
      setBookings(bookingsData.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    setApprovingId(id);
    try {
      await approveProvider(id);
      const providersData = await getProviders();
      setProviders(providersData.providers);
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovingId(null);
    }
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p>Please <button className="btn btn-ghost" onClick={() => navigate('/login')}>log in</button> as an admin to view this page.</p>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return <div className="container" style={{ paddingTop: 40 }}><p>Only admin accounts can access this page.</p></div>;
  }

  const pending = providers.filter((p) => !p.isVerified);
  const approved = providers.filter((p) => p.isVerified);

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <p className="eyebrow">Platform oversight</p>
      <h1 style={{ fontSize: 40, marginBottom: 24 }}>ADMIN</h1>
      {loading && <p className="eyebrow">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <section style={{ marginBottom: 40 }}>
        <p className="section-title">Pending providers ({pending.length})</p>
        {pending.length === 0 && !loading && <p className="eyebrow">No providers waiting on approval.</p>}
        {pending.map((p) => (
          <div key={p.id} className="list-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h4>{p.name}</h4>
              <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }}>{p.email}{p.phone ? ' - ' + p.phone : ''}</p>
              <p className="mono" style={{ margin: '2px 0', fontSize: 12, color: 'var(--ink-muted)' }}>Joined {new Date(p.createdAt).toLocaleDateString()}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {p.idDocumentUrl ? (
                  <a href={API_ORIGIN + p.idDocumentUrl} target="_blank" rel="noreferrer">View ID</a>
                ) : (
                  <span className="eyebrow" style={{ color: 'var(--danger)' }}>No ID uploaded</span>
                )}
                {p.licenseDocumentUrl ? (
                  <a href={API_ORIGIN + p.licenseDocumentUrl} target="_blank" rel="noreferrer">View License</a>
                ) : (
                  <span className="eyebrow" style={{ color: 'var(--danger)' }}>No license uploaded</span>
                )}
              </div>
            </div>
            <button onClick={() => handleApprove(p.id)} disabled={approvingId === p.id} className="btn btn-primary">
              {approvingId === p.id ? 'Approving...' : 'Approve'}
            </button>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 40 }}>
        <p className="section-title">Approved providers ({approved.length})</p>
        {approved.length === 0 && !loading && <p className="eyebrow">None yet.</p>}
        {approved.map((p) => (
          <div key={p.id} className="list-row">
            <h4>{p.name}</h4>
            <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }}>{p.email}</p>
            <span className="badge badge-route" style={{ marginTop: 4, display: 'inline-block' }}>VERIFIED</span>
          </div>
        ))}
      </section>

      <section>
        <p className="section-title">All bookings ({bookings.length})</p>
        {bookings.length === 0 && !loading && <p className="eyebrow">No bookings yet.</p>}
        {bookings.map((b) => (
          <div key={b.id} className="list-row">
            <h4>{b.trip.originCity} to {b.trip.destinationCity}</h4>
            <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }} className="mono">{new Date(b.trip.departureTime).toLocaleString()}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>
              {b.customer.name} ({b.customer.email}) booked {b.seatsBooked} seat(s) with {b.trip.provider.name}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span className="badge badge-route">{b.status}</span>
              <span className="price">R{b.totalPrice}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default AdminDashboard;
