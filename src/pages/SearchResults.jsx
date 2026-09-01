import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchTrips } from '../api/trips';
import CityAutocomplete from '../components/CityAutocomplete';

const TIME_BUCKETS = [
  { id: 'morning', label: 'Morning (5am-12pm)', from: 5, to: 12 },
  { id: 'afternoon', label: 'Afternoon (12pm-5pm)', from: 12, to: 17 },
  { id: 'evening', label: 'Evening (5pm-9pm)', from: 17, to: 21 },
  { id: 'night', label: 'Night (9pm-5am)', from: 21, to: 29 },
];

function getBucket(hour) {
  if (hour >= 21 || hour < 5) return 'night';
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  const seats = searchParams.get('seats') || '1';

  const [formOrigin, setFormOrigin] = useState(origin);
  const [formDestination, setFormDestination] = useState(destination);
  const [formDate, setFormDate] = useState(date);
  const [formSeats, setFormSeats] = useState(seats);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortBy, setSortBy] = useState('price');
  const [maxPrice, setMaxPrice] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState(new Set());
  const [selectedAmenities, setSelectedAmenities] = useState(new Set());

  useEffect(() => {
    setFormOrigin(origin);
    setFormDestination(destination);
    setFormDate(date);
    setFormSeats(seats);

    setLoading(true);
    setError('');
    searchTrips({ origin, destination, date, seats })
      .then((data) => {
        setTrips(data.trips);
        const prices = data.trips.map((t) => t.pricePerSeat);
        setMaxPrice(prices.length ? Math.max(...prices) : 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [origin, destination, date, seats]);

  function handleSwap() {
    setFormOrigin(formDestination);
    setFormDestination(formOrigin);
  }

  function handleModifySearch(e) {
    e.preventDefault();
    setSearchParams({ origin: formOrigin, destination: formDestination, date: formDate, seats: formSeats });
  }

  const highestPrice = useMemo(() => {
    const prices = trips.map((t) => t.pricePerSeat);
    return prices.length ? Math.max(...prices) : 0;
  }, [trips]);

  const allAmenities = useMemo(() => {
    const set = new Set();
    trips.forEach((t) => t.vehicle.amenities.forEach((a) => set.add(a)));
    return Array.from(set);
  }, [trips]);

  function toggleTime(id) {
    const next = new Set(selectedTimes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTimes(next);
  }

  function toggleAmenity(a) {
    const next = new Set(selectedAmenities);
    if (next.has(a)) next.delete(a);
    else next.add(a);
    setSelectedAmenities(next);
  }

  const filteredTrips = useMemo(() => {
    let result = trips.slice();

    if (maxPrice !== null) {
      result = result.filter((t) => t.pricePerSeat <= maxPrice);
    }

    if (selectedTimes.size > 0) {
      result = result.filter((t) => {
        const hour = new Date(t.departureTime).getHours();
        return selectedTimes.has(getBucket(hour));
      });
    }

    if (selectedAmenities.size > 0) {
      result = result.filter((t) =>
        Array.from(selectedAmenities).every((a) => t.vehicle.amenities.includes(a))
      );
    }

    if (sortBy === 'price') {
      result.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    } else if (sortBy === 'time') {
      result.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    } else if (sortBy === 'seats') {
      result.sort((a, b) => (b.totalSeats - b.seatsBooked) - (a.totalSeats - a.seatsBooked));
    }

    return result;
  }, [trips, maxPrice, selectedTimes, selectedAmenities, sortBy]);

  return (
    <div>
      <div className="results-topbar">
        <div className="results-topbar-inner">
          <form onSubmit={handleModifySearch} className="search-pill">
            <CityAutocomplete className="search-pill-field" placeholder="From?" value={formOrigin} onChange={setFormOrigin} />
            <button type="button" className="search-pill-swap" onClick={handleSwap} title="Switch">
              <svg width="17" height="13" viewBox="0 0 18 14" fill="none">
                <path d="M1 4H15M15 4L11.5 0.5M15 4L11.5 7.5" stroke="#15181B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 10H3M3 10L6.5 13.5M3 10L6.5 6.5" stroke="#15181B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <CityAutocomplete className="search-pill-field" placeholder="To?" value={formDestination} onChange={setFormDestination} />
            <div className="search-pill-divider" />
            <div className="search-pill-field">
              <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div className="search-pill-divider" />
            <div className="search-pill-field fixed">
              <input type="number" min="1" value={formSeats} onChange={(e) => setFormSeats(e.target.value)} />
            </div>
            <button type="submit" className="search-pill-submit">Update</button>
          </form>
        </div>
      </div>

      <div className="results-page">
        <div className="results-sidebar">
          <div className="filter-block">
            <h4>Sort by</h4>
            <div className="sort-tabs">
              <button className={'sort-tab' + (sortBy === 'price' ? ' active' : '')} onClick={() => setSortBy('price')}>Cheapest</button>
              <button className={'sort-tab' + (sortBy === 'time' ? ' active' : '')} onClick={() => setSortBy('time')}>Earliest</button>
              <button className={'sort-tab' + (sortBy === 'seats' ? ' active' : '')} onClick={() => setSortBy('seats')}>Most seats</button>
            </div>
          </div>

          <div className="filter-block">
            <h4>Max price per seat</h4>
            <input
              type="range"
              min="0"
              max={highestPrice || 0}
              value={maxPrice ?? highestPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <p className="range-value">Up to R{maxPrice ?? highestPrice}</p>
          </div>

          <div className="filter-block">
            <h4>Departure time</h4>
            {TIME_BUCKETS.map((b) => (
              <label key={b.id} className="checkbox-row">
                <input type="checkbox" checked={selectedTimes.has(b.id)} onChange={() => toggleTime(b.id)} />
                {b.label}
              </label>
            ))}
          </div>

          {allAmenities.length > 0 && (
            <div className="filter-block">
              <h4>Amenities</h4>
              {allAmenities.map((a) => (
                <label key={a} className="checkbox-row">
                  <input type="checkbox" checked={selectedAmenities.has(a)} onChange={() => toggleAmenity(a)} />
                  {a}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="results-main">
          {loading && <p className="eyebrow">Searching...</p>}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && (
            <p className="results-count">
              {filteredTrips.length} {filteredTrips.length === 1 ? 'ride' : 'rides'} found
              {origin && destination ? ' from ' + origin + ' to ' + destination : ''}
            </p>
          )}

          {!loading && !error && filteredTrips.length === 0 && (
            <div className="empty-state">No rides match your filters. Try widening your search.</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredTrips.map((trip) => {
              const seatsLeft = trip.totalSeats - trip.seatsBooked;
              return (
                <div key={trip.id} className="ticket" onClick={() => navigate('/trips/' + trip.id)}>
                  <div className="ticket-route">
                    <div>
                      <div className="ticket-city">{trip.originCity}</div>
                      <div className="ticket-code">DEPARTS</div>
                    </div>
                    <div className="route-line" style={{ margin: '0 20px' }}>
                      <span className="dot" />
                      <span className="bar" />
                      <span className="dot end" />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="ticket-city">{trip.destinationCity}</div>
                      <div className="ticket-code">ARRIVES</div>
                    </div>
                  </div>
                  <div className="ticket-perf">
                    <span className="ticket-perf-dot" />
                    <span className="ticket-perf-line" />
                    <span className="ticket-perf-dot" />
                  </div>
                  <div className="ticket-details">
                    <div className="ticket-meta">
                      <span className="time">{new Date(trip.departureTime).toLocaleString()}</span>
                      <span>{trip.vehicle.make} {trip.vehicle.model} - {trip.provider.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span className="badge badge-brand">{seatsLeft} LEFT</span>
                      <span className="price">R{trip.pricePerSeat}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
