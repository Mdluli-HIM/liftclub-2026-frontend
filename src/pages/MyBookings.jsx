import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings } from '../api/bookings';
import { API_BASE_URL } from '../api/config';

function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      getMyBookings().then((data) => setBookings(data.bookings)).catch((err) => setError(err.message)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p>Please <button className="btn btn-ghost" onClick={() => navigate('/login')}>log in</button> to see your bookings.</p>
      </div>
    );
  }

  if (user.role !== 'CUSTOMER') {
    return <div className="container" style={{ paddingTop: 40 }}><p>Only rider accounts have bookings.</p></div>;
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 700 }}>
      <p className="eyebrow">Your trips</p>
      <h1 style={{ fontSize: 40, marginBottom: 24 }}>MY BOOKINGS</h1>
      {loading && <p className="eyebrow">Loading...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && bookings.length === 0 && <div className="empty-state">You have not booked any trips yet.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bookings.map((b) => {
          const hasPhoto = b.trip.vehicle.photos && b.trip.vehicle.photos.length > 0;
          return (
            <div key={b.id} className="ticket" style={{ cursor: 'default' }}>
              <div className="ticket-route">
                <div>
                  <div className="ticket-city">{b.trip.originCity}</div>
                  <div className="ticket-code">DEPARTS</div>
                </div>
                <div className="route-line" style={{ margin: '0 20px' }}>
                  <span className="dot" /><span className="bar" /><span className="dot end" />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ticket-city">{b.trip.destinationCity}</div>
                  <div className="ticket-code">ARRIVES</div>
                </div>
              </div>
              <div className="ticket-perf">
                <span className="ticket-perf-dot" /><span className="ticket-perf-line" /><span className="ticket-perf-dot" />
              </div>
              <div className="ticket-details" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  {hasPhoto && (
                    <img src={API_BASE_URL + b.trip.vehicle.photos[0]} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div className="ticket-meta">
                        <span className="time">{new Date(b.trip.departureTime).toLocaleString()}</span>
                        <span>
                          {b.trip.vehicle.make} {b.trip.vehicle.model}
                          {b.trip.vehicle.registrationNumber ? ' - ' + b.trip.vehicle.registrationNumber : ''}
                          {' - ' + b.trip.provider.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span className="badge badge-route">{b.status}</span>
                        <span className="price">{b.seatsBooked} seat(s) - R{b.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {b.pickupLocation && (
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                    <p style={{ margin: '2px 0' }}><strong style={{ color: 'var(--ink)' }}>Passenger:</strong> {b.passengerName}</p>
                    <p style={{ margin: '2px 0' }}><strong style={{ color: 'var(--ink)' }}>Phone:</strong> {b.passengerPhone}</p>
                    <p style={{ margin: '2px 0' }}><strong style={{ color: 'var(--ink)' }}>Pickup:</strong> {b.pickupLocation}</p>
                    <p style={{ margin: '2px 0' }}><strong style={{ color: 'var(--ink)' }}>Drop-off:</strong> {b.dropoffLocation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyBookings;
