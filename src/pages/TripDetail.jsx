import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrip } from '../api/trips';
import { createBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TRIP_POLICIES = [
  { icon: 'transfer', text: 'Unlimited transfers are permitted, as long as they are done at least 12 hours before departure. A difference in fare may be payable.' },
  { icon: '10%', text: '10% cancellation fee applies when cancelling before departure (must be done 12 hours or more before departure).' },
  { icon: '100%', text: '100% cancellation fee applies when cancelling or transferring after departure, or within 12 hours of departure.' },
  { icon: 'bags', text: '2 bags up to 25kg are included free of charge.' },
];

function PolicyIcon({ type }) {
  if (type === '10%' || type === '100%') {
    return <div className="policy-icon">{type}</div>;
  }
  if (type === 'transfer') {
    return (
      <div className="policy-icon">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <path d="M1 4H15M15 4L11.5 0.5M15 4L11.5 7.5" stroke="#154984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 10H3M3 10L6.5 13.5M3 10L6.5 6.5" stroke="#154984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className="policy-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="12" rx="1.8" stroke="#154984" strokeWidth="1.6" />
        <path d="M9 8V6.2C9 5.1 9.9 4.2 11 4.2H13C14.1 4.2 15 5.1 15 6.2V8" stroke="#154984" strokeWidth="1.6" />
      </svg>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="#5B6169" strokeWidth="1.6" />
      <path d="M8 11V7.5C8 5 9.8 3.5 12 3.5C14.2 3.5 16 5 16 7.5V11" stroke="#5B6169" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.3" fill="#5B6169" />
    </svg>
  );
}

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentTitle(
    trip ? trip.originCity + ' to ' + trip.destinationCity + ' | Anywhere Shuttles' : 'Trip Details | Anywhere Shuttles',
    trip ? 'Book a seat from ' + trip.originCity + ' to ' + trip.destinationCity + '. R' + trip.pricePerSeat + ' per seat.' : undefined
  );

  const [seats, setSeats] = useState(1);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [showPolicies, setShowPolicies] = useState(false);

  useEffect(() => {
    getTrip(id)
      .then((data) => setTrip(data.trip))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBook(e) {
    e.preventDefault();
    setBookingError('');
    setBooking(true);
    try {
      const data = await createBooking({
        tripId: id,
        seats,
        pickupLocation,
        dropoffLocation,
        passengerName,
        passengerPhone,
      });
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
  const revealedVehicle = bookingSuccess ? bookingSuccess.trip.vehicle : null;
  const revealedProviderName = bookingSuccess ? bookingSuccess.trip.provider.name : null;
  const hasRevealedPhoto = revealedVehicle && revealedVehicle.photos && revealedVehicle.photos.length > 0;

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
          {bookingSuccess ? (
            <>
              {hasRevealedPhoto ? (
                <img
                  src={API_BASE_URL + revealedVehicle.photos[0]}
                  alt={revealedVehicle.make + ' ' + revealedVehicle.model}
                  style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }}
                />
              ) : (
                <div style={{ width: '100%', height: 140, background: 'var(--bg)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="eyebrow">No photo provided by driver</span>
                </div>
              )}
              <h3 style={{ fontSize: 22, marginBottom: 4 }}>{revealedVehicle.make} {revealedVehicle.model} ({revealedVehicle.year})</h3>
              {revealedVehicle.registrationNumber && (
                <p className="mono badge badge-muted" style={{ display: 'inline-block', marginBottom: 10 }}>
                  {revealedVehicle.registrationNumber}
                </p>
              )}
              <p style={{ margin: '0 0 12px' }}>Driver: {revealedProviderName}</p>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 16px', background: 'var(--bg)', borderRadius: 10, marginBottom: 16 }}>
              <LockIcon />
              <p style={{ fontWeight: 600, marginTop: 12, marginBottom: 4 }}>Driver &amp; vehicle revealed after booking</p>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', maxWidth: 320 }}>
                For everyone's privacy, the driver's name and vehicle details are shown once your booking is confirmed.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {trip.vehicle.amenities.length > 0
              ? trip.vehicle.amenities.map((a) => <span key={a} className="badge badge-muted">{a}</span>)
              : <span className="eyebrow">No amenities listed</span>}
          </div>
          <p className="price" style={{ fontSize: 20, marginBottom: 4 }}>
            R{trip.pricePerSeat} <span style={{ fontWeight: 400, color: 'var(--ink-muted)', fontSize: 14 }}>per seat</span>
          </p>
          <p className="eyebrow" style={{ marginBottom: 12 }}>{seatsLeft} of {trip.totalSeats} seats left</p>
          <button type="button" className="policy-link" onClick={() => setShowPolicies(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#35507A" strokeWidth="1.6" />
              <path d="M12 11V17" stroke="#35507A" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="12" cy="7.5" r="1" fill="#35507A" />
            </svg>
            View cancellation, transfer & baggage policy
          </button>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 280, alignSelf: 'flex-start' }}>
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
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Seats</label>
                <input type="number" min="1" max={seatsLeft} value={seats} onChange={(e) => setSeats(e.target.value)} required />
              </div>
              <div className="field">
                <label>Pickup location</label>
                <input placeholder="e.g. Savannah Mall main entrance" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required />
              </div>
              <div className="field">
                <label>Drop-off location</label>
                <input placeholder="e.g. Park Station taxi rank" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} required />
              </div>
              <div className="field">
                <label>Passenger name (optional)</label>
                <input placeholder={'Defaults to ' + user.name} value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
              </div>
              <div className="field">
                <label>Contact phone</label>
                <input type="tel" placeholder="So the driver can reach you" value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} required />
              </div>

              <p className="price">Total: R{(trip.pricePerSeat * seats).toFixed(2)}</p>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                By booking, you agree to the{' '}
                <button type="button" className="policy-link" style={{ display: 'inline', fontSize: 12 }} onClick={() => setShowPolicies(true)}>
                  cancellation & transfer policy
                </button>.
              </p>
              {bookingError && <p className="error-text">{bookingError}</p>}
              <button type="submit" disabled={booking || seatsLeft === 0} className="btn btn-amber" style={{ width: '100%' }}>
                {booking ? 'Booking...' : seatsLeft === 0 ? 'Fully booked' : 'Book now'}
              </button>
            </form>
          )}

          {bookingSuccess && (
            <div>
              <p className="success-text" style={{ marginBottom: 12 }}>
                Booking confirmed for {bookingSuccess.seatsBooked} seat(s), R{bookingSuccess.totalPrice}.
              </p>
              <div className="list-row">
                <p style={{ margin: '2px 0', fontSize: 13 }}><strong>Passenger:</strong> {bookingSuccess.passengerName}</p>
                <p style={{ margin: '2px 0', fontSize: 13 }}><strong>Phone:</strong> {bookingSuccess.passengerPhone}</p>
                <p style={{ margin: '2px 0', fontSize: 13 }}><strong>Pickup:</strong> {bookingSuccess.pickupLocation}</p>
                <p style={{ margin: '2px 0', fontSize: 13 }}><strong>Drop-off:</strong> {bookingSuccess.dropoffLocation}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPolicies && (
        <div className="modal-overlay" onClick={() => setShowPolicies(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 24 }}>Trip policies</h3>
              <button className="modal-close" onClick={() => setShowPolicies(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {TRIP_POLICIES.map((p, i) => (
              <div key={i} className="policy-row">
                <PolicyIcon type={p.icon} />
                <p className="policy-text">{p.text}</p>
              </div>
            ))}

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowPolicies(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripDetail;
