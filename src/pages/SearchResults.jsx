import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchTrips, getDatePrices } from '../api/trips';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

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

function formatDateStripLabels(isoDateStr) {
  const d = new Date(isoDateStr + 'T00:00:00');
  return {
    day: d.toLocaleDateString('en-ZA', { weekday: 'short' }),
    short: d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
  };
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 7H13M19 7H20M4 17H11M17 17H20M4 12H8M14 12H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2.1" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="12" r="2.1" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="17" r="2.1" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  const seats = searchParams.get('seats') || '1';

  useDocumentTitle(
    origin && destination
      ? origin + ' to ' + destination + ' Shuttles | Anywhere Shuttles'
      : 'Search Shuttles | Anywhere Shuttles',
    origin && destination
      ? 'Compare shuttle and private car trips from ' + origin + ' to ' + destination + '. Book your seat online with verified drivers.'
      : 'Search for shuttle and private car trips across South Africa.'
  );

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [datePrices, setDatePrices] = useState([]);
  const dateStripRef = useRef(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [maxPrice, setMaxPrice] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState(new Set());
  const [selectedAmenities, setSelectedAmenities] = useState(new Set());

  useEffect(() => {
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

  // Deliberately excludes `date` - keeps the 7-day window anchored in place
  // while the user taps between days, instead of jumping around.
  useEffect(() => {
    if (!origin.trim() || !destination.trim()) {
      setDatePrices([]);
      return;
    }
    getDatePrices({ origin, destination, seats, date: date || undefined })
      .then((data) => setDatePrices(data.prices))
      .catch(() => setDatePrices([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, seats]);

  function handleDateSelect(newDate) {
    setSearchParams({ origin, destination, date: newDate, seats });
  }

  function scrollStrip(dir) {
    if (dateStripRef.current) {
      dateStripRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
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

  const activeFilterCount =
    (selectedTimes.size > 0 ? 1 : 0) +
    (selectedAmenities.size > 0 ? 1 : 0) +
    (maxPrice !== null && maxPrice < highestPrice ? 1 : 0);

  return (
    <div>
      <div className="results-header">
        <button className="results-header-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <BackIcon />
        </button>
        <h1 className="results-header-title">
          {origin && destination ? origin + ' to ' + destination : 'Search Results'}
        </h1>
        <button className="results-header-btn" onClick={() => setFiltersOpen(true)} aria-label="Filters">
          <FilterIcon />
          {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="results-page">
        {datePrices.length > 0 && (
          <div className="date-strip-card" style={{ width: '100%' }}>
            <button type="button" className="date-strip-nav" onClick={() => scrollStrip(-1)} aria-label="Scroll earlier">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="date-strip-scroll" ref={dateStripRef}>
              {datePrices.map((p) => {
                const { day, short } = formatDateStripLabels(p.date);
                return (
                  <button
                    key={p.date}
                    type="button"
                    className={'date-strip-item' + (p.date === date ? ' active' : '')}
                    onClick={() => p.hasTrips && handleDateSelect(p.date)}
                    disabled={!p.hasTrips}
                  >
                    <div className="date-strip-day">{day}</div>
                    <div className="date-strip-date">{short}</div>
                    {p.hasTrips
                      ? <div className="date-strip-price">R{p.minPrice}</div>
                      : <div className="date-strip-noprice">No rides</div>}
                  </button>
                );
              })}
            </div>
            <button type="button" className="date-strip-nav" onClick={() => scrollStrip(1)} aria-label="Scroll later">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}

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

      {filtersOpen && (
        <div className="modal-overlay" onClick={() => setFiltersOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 22 }}>Filters</h3>
              <button className="modal-close" onClick={() => setFiltersOpen(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', marginBottom: 12 }}>Sort by</h4>
              <div className="sort-tabs">
                <button className={'sort-tab' + (sortBy === 'price' ? ' active' : '')} onClick={() => setSortBy('price')}>Cheapest</button>
                <button className={'sort-tab' + (sortBy === 'time' ? ' active' : '')} onClick={() => setSortBy('time')}>Earliest</button>
                <button className={'sort-tab' + (sortBy === 'seats' ? ' active' : '')} onClick={() => setSortBy('seats')}>Most seats</button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', marginBottom: 12 }}>Max price per seat</h4>
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

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', marginBottom: 12 }}>Departure time</h4>
              {TIME_BUCKETS.map((b) => (
                <label key={b.id} className="checkbox-row">
                  <input type="checkbox" checked={selectedTimes.has(b.id)} onChange={() => toggleTime(b.id)} />
                  {b.label}
                </label>
              ))}
            </div>

            {allAmenities.length > 0 && (
              <div>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', marginBottom: 12 }}>Amenities</h4>
                {allAmenities.map((a) => (
                  <label key={a} className="checkbox-row">
                    <input type="checkbox" checked={selectedAmenities.has(a)} onChange={() => toggleAmenity(a)} />
                    {a}
                  </label>
                ))}
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => setFiltersOpen(false)}>
              Show {filteredTrips.length} {filteredTrips.length === 1 ? 'result' : 'results'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
