import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createVehicle, getMyVehicles } from '../api/vehicles';
import { createTrip, getMyTrips } from '../api/trips';
import { uploadProviderDocuments } from '../api/providers';
import CityAutocomplete from '../components/CityAutocomplete';

function ProviderDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: '', seatCapacity: '', color: '', amenities: '' });
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [vehicleError, setVehicleError] = useState('');

  const [tripForm, setTripForm] = useState({ vehicleId: '', originCity: '', destinationCity: '', departureTime: '', pricePerSeat: '', totalSeats: '' });
  const [tripSaving, setTripSaving] = useState(false);
  const [tripError, setTripError] = useState('');

  const [idFile, setIdFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [docsUploading, setDocsUploading] = useState(false);
  const [docsError, setDocsError] = useState('');
  const [docsSuccess, setDocsSuccess] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === tripForm.vehicleId);

  useEffect(() => {
    if (user && user.role === 'PROVIDER') loadData();
    else setLoading(false);
  }, [user]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [vehiclesData, tripsData] = await Promise.all([getMyVehicles(), getMyTrips()]);
      setVehicles(vehiclesData.vehicles);
      setTrips(tripsData.trips);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadDocs(e) {
    e.preventDefault();
    setDocsError('');
    setDocsSuccess(false);

    if (!idFile && !licenseFile) {
      setDocsError('Choose at least one file to upload.');
      return;
    }

    setDocsUploading(true);
    try {
      await uploadProviderDocuments({ idDocument: idFile, licenseDocument: licenseFile });
      await refreshUser();
      setIdFile(null);
      setLicenseFile(null);
      setDocsSuccess(true);
    } catch (err) {
      setDocsError(err.message);
    } finally {
      setDocsUploading(false);
    }
  }

  async function handleAddVehicle(e) {
    e.preventDefault();
    setVehicleError('');
    setVehicleSaving(true);
    try {
      const amenities = vehicleForm.amenities.split(',').map((a) => a.trim()).filter(Boolean);
      await createVehicle({
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: Number(vehicleForm.year),
        seatCapacity: Number(vehicleForm.seatCapacity),
        color: vehicleForm.color || undefined,
        amenities,
      });
      setVehicleForm({ make: '', model: '', year: '', seatCapacity: '', color: '', amenities: '' });
      const vehiclesData = await getMyVehicles();
      setVehicles(vehiclesData.vehicles);
    } catch (err) {
      setVehicleError(err.message);
    } finally {
      setVehicleSaving(false);
    }
  }

  async function handlePostTrip(e) {
    e.preventDefault();
    setTripError('');

    if (selectedVehicle && Number(tripForm.totalSeats) > selectedVehicle.seatCapacity) {
      setTripError('This vehicle only has ' + selectedVehicle.seatCapacity + ' seats. Lower the total seats or pick a different vehicle.');
      return;
    }

    setTripSaving(true);
    try {
      await createTrip({
        vehicleId: tripForm.vehicleId,
        originCity: tripForm.originCity,
        destinationCity: tripForm.destinationCity,
        departureTime: new Date(tripForm.departureTime).toISOString(),
        pricePerSeat: Number(tripForm.pricePerSeat),
        totalSeats: Number(tripForm.totalSeats),
      });
      setTripForm({ vehicleId: '', originCity: '', destinationCity: '', departureTime: '', pricePerSeat: '', totalSeats: '' });
      const tripsData = await getMyTrips();
      setTrips(tripsData.trips);
    } catch (err) {
      setTripError(err.message);
    } finally {
      setTripSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p>Please <button className="btn btn-ghost" onClick={() => navigate('/login')}>log in</button> as a provider to view this page.</p>
      </div>
    );
  }

  if (user.role !== 'PROVIDER') {
    return <div className="container" style={{ paddingTop: 40 }}><p>Only provider accounts can access the dashboard.</p></div>;
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <p className="eyebrow">Provider tools</p>
      <h1 style={{ fontSize: 40, marginBottom: 24 }}>DASHBOARD</h1>
      {loading && <p className="eyebrow">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!user.isVerified && (
        <div className="card" style={{ marginBottom: 28, borderColor: 'var(--amber)', background: '#FFF9EF' }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Your account is pending verification</p>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 16 }}>
            You can add vehicles now, but you will not be able to post trips until an admin approves your account.
            Upload a photo of your ID and driver's license below to speed this up.
          </p>
          <form onSubmit={handleUploadDocs} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 1, minWidth: 200 }}>
              <label>ID document</label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files[0])} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 200 }}>
              <label>Driver's license</label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setLicenseFile(e.target.files[0])} />
            </div>
            <button type="submit" className="btn btn-amber" disabled={docsUploading}>
              {docsUploading ? 'Uploading...' : 'Upload documents'}
            </button>
          </form>
          {docsError && <p className="error-text" style={{ marginTop: 10 }}>{docsError}</p>}
          {docsSuccess && <p className="success-text" style={{ marginTop: 10 }}>Documents uploaded. An admin will review them shortly.</p>}
        </div>
      )}

      {user.isVerified && (
        <div className="card" style={{ marginBottom: 28, borderColor: 'var(--route)', background: '#F3F8F5' }}>
          <span className="badge badge-route">VERIFIED PROVIDER</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <section style={{ flex: 1, minWidth: 320 }}>
          <p className="section-title">Your vehicles</p>
          <form onSubmit={handleAddVehicle} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <div className="field"><label>Make</label><input value={vehicleForm.make} onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })} required /></div>
            <div className="field"><label>Model</label><input value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} required /></div>
            <div className="field"><label>Year</label><input type="number" value={vehicleForm.year} onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })} required /></div>
            <div className="field"><label>Seat capacity</label><input type="number" min="1" value={vehicleForm.seatCapacity} onChange={(e) => setVehicleForm({ ...vehicleForm, seatCapacity: e.target.value })} required /></div>
            <div className="field"><label>Color (optional)</label><input value={vehicleForm.color} onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })} /></div>
            <div className="field"><label>Amenities (comma separated)</label><input value={vehicleForm.amenities} onChange={(e) => setVehicleForm({ ...vehicleForm, amenities: e.target.value })} /></div>
            {vehicleError && <p className="error-text">{vehicleError}</p>}
            <button type="submit" disabled={vehicleSaving} className="btn btn-primary">{vehicleSaving ? 'Saving...' : 'Add vehicle'}</button>
          </form>

          {vehicles.length === 0 && !loading && <p className="eyebrow">No vehicles yet.</p>}
          {vehicles.map((v) => (
            <div key={v.id} className="list-row">
              <h4>{v.make} {v.model} ({v.year})</h4>
              <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }}>Seats: {v.seatCapacity}</p>
              {v.amenities.length > 0 && <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }}>{v.amenities.join(', ')}</p>}
            </div>
          ))}
        </section>

        <section style={{ flex: 1, minWidth: 320 }}>
          <p className="section-title">Your trips</p>
          <form onSubmit={handlePostTrip} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <div className="field">
              <label>Vehicle</label>
              <select value={tripForm.vehicleId} onChange={(e) => setTripForm({ ...tripForm, vehicleId: e.target.value, totalSeats: '' })} required>
                <option value="">Select a vehicle</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year}) - {v.seatCapacity} seats</option>)}
              </select>
            </div>
            <CityAutocomplete className="field" label="From city" placeholder="e.g. Polokwane" value={tripForm.originCity} onChange={(val) => setTripForm({ ...tripForm, originCity: val })} required />
            <CityAutocomplete className="field" label="To city" placeholder="e.g. Johannesburg" value={tripForm.destinationCity} onChange={(val) => setTripForm({ ...tripForm, destinationCity: val })} required />
            <div className="field"><label>Departure</label><input type="datetime-local" value={tripForm.departureTime} onChange={(e) => setTripForm({ ...tripForm, departureTime: e.target.value })} required /></div>
            <div className="field"><label>Price per seat (R)</label><input type="number" min="1" value={tripForm.pricePerSeat} onChange={(e) => setTripForm({ ...tripForm, pricePerSeat: e.target.value })} required /></div>
            <div className="field">
              <label>Total seats {selectedVehicle ? '(max ' + selectedVehicle.seatCapacity + ')' : ''}</label>
              <input
                type="number"
                min="1"
                max={selectedVehicle ? selectedVehicle.seatCapacity : undefined}
                value={tripForm.totalSeats}
                onChange={(e) => setTripForm({ ...tripForm, totalSeats: e.target.value })}
                disabled={!selectedVehicle}
                required
              />
            </div>
            {tripError && <p className="error-text">{tripError}</p>}
            <button type="submit" disabled={tripSaving || vehicles.length === 0} className="btn btn-primary">
              {vehicles.length === 0 ? 'Add a vehicle first' : tripSaving ? 'Posting...' : 'Post trip'}
            </button>
          </form>

          {trips.length === 0 && !loading && <p className="eyebrow">No trips posted yet.</p>}
          {trips.map((t) => (
            <div key={t.id} className="list-row">
              <h4>{t.originCity} to {t.destinationCity}</h4>
              <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }} className="mono">{new Date(t.departureTime).toLocaleString()}</p>
              <p style={{ margin: '6px 0 0', fontSize: 13 }}>{t.seatsBooked} / {t.totalSeats} booked - R{t.pricePerSeat}/seat</p>
              <span className="badge badge-route" style={{ marginTop: 6, display: 'inline-block' }}>{t.status}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default ProviderDashboard;
