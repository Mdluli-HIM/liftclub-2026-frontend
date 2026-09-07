import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrip, getTripPassengers } from '../api/trips';

function TripPassengers() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'PROVIDER') {
      setLoading(false);
      return;
    }
    Promise.all([getTrip(id), getTripPassengers(id)])
      .then(([tripData, passengersData]) => {
        setTrip(tripData.trip);
        setPassengers(passengersData.bookings);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p>Please <button className="btn btn-ghost" onClick={() => navigate('/login')}>log in</button> as a provider to view this page.</p>
      </div>
    );
  }

  if (user.role !== 'PROVIDER') {
    return <div className="container" style={{ paddingTop: 40 }}><p>Only provider accounts can view passenger lists.</p></div>;
  }

  const totalSeatsBooked = passengers.reduce((sum, p) => sum + p.seatsBooked, 0);

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 700 }}>
      <Link to="/dashboard" style={{ fontSize: 13 }}>Back to dashboard</Link>
      <p className="eyebrow" style={{ marginTop: 16 }}>Passenger list</p>

      {loading && <p className="eyebrow">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {trip && (
        <>
          <h1 style={{ fontSize: 34, marginBottom: 4 }}>{trip.originCity} to {trip.destinationCity}</h1>
          <p className="mono" style={{ color: 'var(--ink-muted)', marginBottom: 24 }}>
            {new Date(trip.departureTime).toLocaleString()} - {totalSeatsBooked} of {trip.totalSeats} seats booked
          </p>
        </>
      )}

      {!loading && passengers.length === 0 && <div className="empty-state">No one has booked this trip yet.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {passengers.map((p) => (
          <div key={p.id} className="list-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h4>{p.passengerName || p.customer.name}</h4>
                <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }}>
                  {p.passengerPhone || p.customer.phone || 'No phone on file'}
                </p>
              </div>
              <span className="badge badge-route">{p.seatsBooked} seat(s)</span>
            </div>
            {(p.pickupLocation || p.dropoffLocation) && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)', fontSize: 13 }}>
                {p.pickupLocation && <p style={{ margin: '2px 0' }}><strong>Pickup:</strong> {p.pickupLocation}</p>}
                {p.dropoffLocation && <p style={{ margin: '2px 0' }}><strong>Drop-off:</strong> {p.dropoffLocation}</p>}
              </div>
            )}
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-muted)' }}>
              Booked via account: {p.customer.name} ({p.customer.email})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TripPassengers;
