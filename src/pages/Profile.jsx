import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../api/auth';

function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user ? user.name : '');
  const [phone, setPhone] = useState(user && user.phone ? user.phone : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <p>Please <button className="btn btn-ghost" onClick={() => navigate('/login')}>log in</button> to view your profile.</p>
      </div>
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      await updateMe({ name, phone });
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const statusBadgeClass = user.verificationStatus === 'APPROVED' ? 'badge-route' : user.verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-amber';
  const statusLabel = user.verificationStatus === 'APPROVED' ? 'VERIFIED' : user.verificationStatus === 'REJECTED' ? 'REJECTED' : 'PENDING VERIFICATION';

  return (
    <div className="container" style={{ maxWidth: 500, paddingTop: 48, paddingBottom: 60 }}>
      <p className="eyebrow">Your account</p>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>PROFILE</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <span className="badge badge-muted">{user.role}</span>
        {user.role === 'PROVIDER' && <span className={'badge ' + statusBadgeClass}>{statusLabel}</span>}
      </div>

      <div className="card">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={user.email} disabled style={{ background: '#F5F5F2', color: 'var(--ink-muted)' }} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input type="tel" placeholder="Not set" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <p className="eyebrow">Member since {new Date(user.createdAt).toLocaleDateString()}</p>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">Profile updated.</p>}

          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {user.role === 'PROVIDER' && (
        <div className="card" style={{ marginTop: 20 }}>
          <p className="section-title" style={{ fontSize: 20, marginBottom: 12 }}>Verification documents</p>
          {user.verificationStatus === 'REJECTED' && user.rejectionReason && (
            <p className="error-text" style={{ marginBottom: 12 }}><strong>Rejected:</strong> {user.rejectionReason}</p>
          )}
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 8 }}>
            {user.idDocumentUrl ? 'ID document uploaded.' : 'No ID document uploaded yet.'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 12 }}>
            {user.licenseDocumentUrl ? 'License document uploaded.' : 'No license document uploaded yet.'}
          </p>
          {user.verificationStatus !== 'APPROVED' && (
            <p style={{ fontSize: 13 }}>
              Manage document uploads from your <a href="/dashboard">dashboard</a>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
