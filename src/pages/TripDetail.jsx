import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrip } from '../api/trips';
import { createBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    getTrip(id)
      .then((data) => setTrip(data.trip))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBook() {
    setBookingError('');
    setBooking(true);
    try {
      const data = await createBooking(id, seats);
      setBookingSuccess(data.booking);
      const updated = await getTrip(id);
      setTrip(updated.trip);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <p className="container" style={{ paddingTop: 40 }}>Loading...</p>;
  if (error) return <p className="container error-text" style={{ paddingTop: 40 }}>{error}</p>;
  if (!trip) return null;

  const seatsLeft = trip.totalSeats - trip.seatsBooked;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <p className="eyebrow">Trip details</p>
      <div className="ticket-route" style={{ padding: '0 0 8px' }}>
        <div>
          <div className="ticket-city" style={{ fontSize: 40 }}>{trip.originCity}</div>
          <div className="ticket-code">DEPARTS</div>
        </div>
        <div className="route-line" style={{ margin: '0 24px' }}>
          <span className="dot" />
          <span className="bar" />
          <span className="dot end" />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="ticket-city" style={{ fontSize: 40 }}>{trip.destinationCity}</div>
          <div className="ticket-code">ARRIVES</div>
        </div>
      </div>
      <p className="mono" style={{ color: 'var(--ink-muted)' }}>{new Date(trip.departureTime).toLocaleString()}</p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 24 }}>
        <div className="card" style={{ flex: 2, minWidth: 300 }}>
          <h3 style={{ fontSize: 22, marginBottom: 8 }}>{trip.vehicle.make} {trip.vehicle.model} ({trip.vehicle.year})</h3>
          <p style={{ margin: '0 0 12px' }}>Driver: {trip.provider.name}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {trip.vehicle.amenities.length > 0
              ? trip.vehicle.amenities.map((a) => <span key={a} className="badge badge-muted">{a}</span>)
              : <span className="eyebrow">No amenities listed</span>}
          </div>
          <p className="price" style={{ fontSize: 20, marginBottom: 4 }}>
            R{trip.pricePerSeat} <span style={{ fontWeight: 400, color: 'var(--ink-muted)', fontSize: 14 }}>per seat</span>
          </p>
          <p className="eyebrow">{seatsLeft} of {trip.totalSeats} seats left</p>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 260, alignSelf: 'flex-start' }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Book this ride</p>

          {!user && (
            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%' }}>
              Log in to book
            </button>
          )}

          {user && user.role !== 'CUSTOMER' && (
            <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Only rider accounts can book trips.</p>
          )}

          {user && user.role === 'CUSTOMER' && !bookingSuccess && (
            <>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Seats</label>
                <input type="number" min="1" max={seatsLeft} value={seats} onChange={(e) => setSeats(e.target.value)} />
              </div>
              <p className="price" style={{ marginBottom: 12 }}>Total: R{(trip.pricePerSeat * seats).toFixed(2)}</p>
              {bookingError && <p className="error-text" style={{ marginBottom: 12 }}>{bookingError}</p>}
              <button
                onClick={handleBook}
                disabled={booking || seatsLeft === 0}
                className="btn btn-amber"
                style={{ width: '100%' }}
              >
                {booking ? 'Booking...' : seatsLeft === 0 ? 'Fully booked' : 'Book now'}
              </button>
            </>
          )}

          {bookingSuccess && (
            <p className="success-text">
              Booking confirmed. You booked {bookingSuccess.seatsBooked} seat(s) for R{bookingSuccess.totalPrice}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripDetail;
