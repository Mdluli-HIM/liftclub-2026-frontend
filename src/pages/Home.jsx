import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CityAutocomplete from '../components/CityAutocomplete';

function Home() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const navigate = useNavigate();

  function handleSwap() {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  }

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams({ origin, destination, date, seats });
    navigate('/search?' + params.toString());
  }

  return (
    <div>
      <div className="hero2">
        <div className="hero2-left">
          <h1 className="hero-heading">Find a ride across South Africa</h1>
          <p className="subtitle">
            Search real trips already being driven, and book your seat directly with the driver.
          </p>

          <div className="tile-row">
            <div className="tile">
              <div className="tile-icon active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 13L4.6 8C4.9 7 5.8 6.3 6.9 6.3H17.1C18.2 6.3 19.1 7 19.4 8L21 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="2" y="13" width="20" height="6.5" rx="1.6" stroke="white" strokeWidth="1.5" />
                  <circle cx="7" cy="19.5" r="1.6" fill="white" />
                  <circle cx="17" cy="19.5" r="1.6" fill="white" />
                </svg>
              </div>
              <span>Rides</span>
            </div>
            <div className="tile">
              <div className="tile-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L19 6V11C19 15.5 16 18.8 12 20C8 18.8 5 15.5 5 11V6L12 3Z" stroke="#15181B" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <span>Verified</span>
            </div>
            <div className="tile">
              <div className="tile-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M7 4H14C14.6 4 15 4.4 15 5V13H7V4Z" stroke="#15181B" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M7 13H5.5C4.7 13 4 13.7 4 14.5V19H16.5" stroke="#15181B" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <span>Live seats</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="search-pill">
            <CityAutocomplete className="search-pill-field" placeholder="From?" value={origin} onChange={setOrigin} />
            <button type="button" className="search-pill-swap" onClick={handleSwap} title="Switch">
              <svg width="17" height="13" viewBox="0 0 18 14" fill="none">
                <path d="M1 4H15M15 4L11.5 0.5M15 4L11.5 7.5" stroke="#15181B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 10H3M3 10L6.5 13.5M3 10L6.5 6.5" stroke="#15181B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <CityAutocomplete className="search-pill-field" placeholder="To?" value={destination} onChange={setDestination} />
            <div className="search-pill-divider" />
            <div className="search-pill-field">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="search-pill-divider" />
            <div className="search-pill-field fixed" title="Number of seats">
              <input type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} />
            </div>
            <button type="submit" className="search-pill-submit">Search</button>
          </form>
        </div>

        <div className="hero2-right">
          <div className="collage">
            <div className="collage-panel c1" />
            <div className="collage-panel c2" />
            <div className="collage-panel c3" />
            <div className="collage-panel c4" />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 56, paddingBottom: 24 }}>
        <h2 className="section-heading">Why book with RideBooker</h2>
      </div>

      <div className="feature-row" style={{ paddingTop: 0 }}>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L19 6V11C19 15.5 16 18.8 12 20C8 18.8 5 15.5 5 11V6L12 3Z" stroke="#EE7A24" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h4>Verified drivers</h4>
          <p>Every provider is checked and approved by our team before they can post a trip.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 4H14C14.6 4 15 4.4 15 5V13H7V4Z" stroke="#EE7A24" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h4>Live seat availability</h4>
          <p>Seat counts update in real time, so you never book a seat that is already gone.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4 14H11L10 22L20 9H13L13 2Z" stroke="#EE7A24" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <h4>Direct booking</h4>
          <p>Book straight from the driver's real schedule. No call centres, no waiting.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12.6 3H19C19.6 3 20 3.4 20 4V10.4C20 10.7 19.9 11 19.7 11.2L11.7 19.2C11.3 19.6 10.7 19.6 10.3 19.2L4.8 13.7C4.4 13.3 4.4 12.7 4.8 12.3L12.8 4.3C13 4.1 13.3 4 13.6 4" stroke="#EE7A24" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="16" cy="7" r="1.3" fill="#EE7A24" />
            </svg>
          </div>
          <h4>Fair, upfront pricing</h4>
          <p>See the full price per seat before you book. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
