import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProviders, getProviderDetail, approveProvider, rejectProvider, getAllBookings } from '../api/admin';
import { API_BASE_URL } from '../api/config';

function statusBadgeClass(status) {
  if (status === 'APPROVED') return 'badge badge-route';
  if (status === 'REJECTED') return 'badge badge-danger';
  return 'badge badge-amber';
}

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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

  async function openDetail(id) {
    setSelectedId(id);
    setDetail(null);
    setDetailError('');
    setShowRejectForm(false);
    setRejectReason('');
    setDetailLoading(true);
    try {
      const data = await getProviderDetail(id);
      setDetail(data);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedId(null);
    setDetail(null);
    setShowRejectForm(false);
  }

  async function refreshAfterAction(id) {
    const providersData = await getProviders();
    setProviders(providersData.providers);
    if (selectedId === id) {
      const data = await getProviderDetail(id);
      setDetail(data);
    }
  }

  async function handleApprove(id) {
    setActionLoading(true);
    try {
      await approveProvider(id);
      await refreshAfterAction(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(id) {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await rejectProvider(id, rejectReason.trim());
      setShowRejectForm(false);
      setRejectReason('');
      await refreshAfterAction(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
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

  const pending = providers.filter((p) => p.verificationStatus === 'PENDING');
  const approved = providers.filter((p) => p.verificationStatus === 'APPROVED');
  const rejected = providers.filter((p) => p.verificationStatus === 'REJECTED');

  function ProviderRow({ p }) {
    return (
      <div className="list-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h4>{p.name}</h4>
          <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }}>{p.email}{p.phone ? ' - ' + p.phone : ''}</p>
          <p className="mono" style={{ margin: '2px 0', fontSize: 12, color: 'var(--ink-muted)' }}>Joined {new Date(p.createdAt).toLocaleDateString()}</p>
          <span className={statusBadgeClass(p.verificationStatus)} style={{ marginTop: 6, display: 'inline-block' }}>{p.verificationStatus}</span>
        </div>
        <button onClick={() => openDetail(p.id)} className="btn btn-ghost">View details</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <p className="eyebrow">Platform oversight</p>
      <h1 style={{ fontSize: 40, marginBottom: 24 }}>ADMIN</h1>
      {loading && <p className="eyebrow">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <section style={{ marginBottom: 40 }}>
        <p className="section-title">Pending providers ({pending.length})</p>
        {pending.length === 0 && !loading && <p className="eyebrow">No providers waiting on approval.</p>}
        {pending.map((p) => <ProviderRow key={p.id} p={p} />)}
      </section>

      <section style={{ marginBottom: 40 }}>
        <p className="section-title">Approved providers ({approved.length})</p>
        {approved.length === 0 && !loading && <p className="eyebrow">None yet.</p>}
        {approved.map((p) => <ProviderRow key={p.id} p={p} />)}
      </section>

      <section style={{ marginBottom: 40 }}>
        <p className="section-title">Rejected providers ({rejected.length})</p>
        {rejected.length === 0 && !loading && <p className="eyebrow">None.</p>}
        {rejected.map((p) => <ProviderRow key={p.id} p={p} />)}
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

      {selectedId && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 24 }}>Provider details</h3>
              <button className="modal-close" onClick={closeDetail} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {detailLoading && <p className="eyebrow">Loading...</p>}
            {detailError && <p className="error-text">{detailError}</p>}

            {detail && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h4 style={{ fontSize: 20, marginBottom: 4 }}>{detail.provider.name}</h4>
                      <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '2px 0' }}>{detail.provider.email}</p>
                      <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '2px 0' }}>{detail.provider.phone || 'No phone on file'}</p>
                      <p className="mono" style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '2px 0' }}>
                        Joined {new Date(detail.provider.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={statusBadgeClass(detail.provider.verificationStatus)}>{detail.provider.verificationStatus}</span>
                  </div>

                  {detail.provider.verificationStatus === 'REJECTED' && detail.provider.rejectionReason && (
                    <p className="error-text" style={{ marginTop: 10 }}>
                      <strong>Rejection reason:</strong> {detail.provider.rejectionReason}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    {detail.provider.idDocumentUrl ? (
                      <a href={API_BASE_URL + detail.provider.idDocumentUrl} target="_blank" rel="noreferrer">View ID</a>
                    ) : (
                      <span className="eyebrow" style={{ color: 'var(--danger)' }}>No ID uploaded</span>
                    )}
                    {detail.provider.licenseDocumentUrl ? (
                      <a href={API_BASE_URL + detail.provider.licenseDocumentUrl} target="_blank" rel="noreferrer">View License</a>
                    ) : (
                      <span className="eyebrow" style={{ color: 'var(--danger)' }}>No license uploaded</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    {detail.provider.verificationStatus !== 'APPROVED' && (
                      <button className="btn btn-primary" disabled={actionLoading} onClick={() => handleApprove(detail.provider.id)}>
                        {actionLoading ? 'Working...' : 'Approve'}
                      </button>
                    )}
                    {detail.provider.verificationStatus !== 'REJECTED' && !showRejectForm && (
                      <button className="btn btn-ghost" onClick={() => setShowRejectForm(true)}>
                        Reject
                      </button>
                    )}
                  </div>

                  {showRejectForm && (
                    <div style={{ marginTop: 12 }}>
                      <div className="field">
                        <label>Reason for rejection</label>
                        <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. ID photo is blurry, please re-upload" />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          className="btn btn-primary"
                          style={{ background: 'var(--danger)' }}
                          disabled={actionLoading || !rejectReason.trim()}
                          onClick={() => handleReject(detail.provider.id)}
                        >
                          {actionLoading ? 'Working...' : 'Confirm reject'}
                        </button>
                        <button className="btn btn-ghost" onClick={() => setShowRejectForm(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <p className="section-title" style={{ fontSize: 18 }}>Vehicles ({detail.vehicles.length})</p>
                  {detail.vehicles.length === 0 && <p className="eyebrow">No vehicles added yet.</p>}
                  {detail.vehicles.map((v) => (
                    <div key={v.id} className="list-row" style={{ display: 'flex', gap: 12 }}>
                      {v.photos && v.photos.length > 0 && (
                        <img src={API_BASE_URL + v.photos[0]} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                      )}
                      <div>
                        <h4>{v.make} {v.model} ({v.year})</h4>
                        <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }}>Seats: {v.seatCapacity}</p>
                        {v.registrationNumber && <p className="mono" style={{ margin: '2px 0', fontSize: 13 }}>{v.registrationNumber}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="section-title" style={{ fontSize: 18 }}>Trips ({detail.trips.length})</p>
                  {detail.trips.length === 0 && <p className="eyebrow">No trips posted yet.</p>}
                  {detail.trips.map((t) => (
                    <div key={t.id} className="list-row">
                      <h4>{t.originCity} to {t.destinationCity}</h4>
                      <p className="mono" style={{ margin: '2px 0', fontSize: 13, color: 'var(--ink-muted)' }}>{new Date(t.departureTime).toLocaleString()}</p>
                      <p style={{ margin: '6px 0 0', fontSize: 13 }}>{t.seatsBooked} / {t.totalSeats} booked</p>
                      <span className="badge badge-route" style={{ marginTop: 6, display: 'inline-block' }}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
