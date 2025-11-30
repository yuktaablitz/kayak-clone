import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchFlights } from '../services/flightService';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const [origin, setOrigin] = React.useState(params.get('origin') || '');
  const [destination, setDestination] = React.useState(params.get('destination') || '');
  const [departureDate, setDepartureDate] = React.useState(params.get('departureDate') || '');
  const [returnDate, setReturnDate] = React.useState(params.get('returnDate') || '');
  const [flightClass, setFlightClass] = React.useState(params.get('class') || 'Economy');

  const [loading, setLoading] = React.useState(true);
  const [flights, setFlights] = React.useState([]);
  const [error, setError] = React.useState('');

  const [favorites, setFavorites] = React.useState([]); // array of flight_ids

  const [selectedStops, setSelectedStops] = React.useState('any'); // any | nonstop | onestop | twoplus
  const [selectedAirlines, setSelectedAirlines] = React.useState([]);
  const [maxDuration, setMaxDuration] = React.useState(0); // in minutes, 0 = no limit
  const [sortBy, setSortBy] = React.useState('cheapest'); // cheapest | quickest

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const o = searchParams.get('origin');
    const d = searchParams.get('destination');
    const dep = searchParams.get('departureDate');
    const cls = searchParams.get('class') || 'Economy';

    if (!o || !d || !dep) {
      setError('Missing search parameters');
      setLoading(false);
      return;
    }

    setOrigin(o);
    setDestination(d);
    setDepartureDate(dep);
    setReturnDate(searchParams.get('returnDate') || '');
    setFlightClass(cls);

    setLoading(true);
    searchFlights({ origin: o, destination: d, departureDate: dep, class: cls })
      .then((res) => {
        const list = res.data || [];
        setFlights(list);
        const maxDur = list.reduce(
          (max, f) => (f.duration_minutes && f.duration_minutes > max ? f.duration_minutes : max),
          0
        );
        setMaxDuration(maxDur);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    newParams.set('origin', origin.toUpperCase());
    newParams.set('destination', destination.toUpperCase());
    newParams.set('departureDate', departureDate);
    newParams.set('class', flightClass);
    if (returnDate) newParams.set('returnDate', returnDate);
    navigate(`/search?${newParams.toString()}`);
  };

  const allAirlines = Array.from(new Set(flights.map((f) => f.airline_name))).filter(Boolean);

  const toggleAirline = (name) => {
    setSelectedAirlines((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const filteredFlights = flights
    .filter((f) => {
      if (selectedStops === 'nonstop' && f.stops !== 0) return false;
      if (selectedStops === 'onestop' && f.stops !== 1) return false;
      if (selectedStops === 'twoplus' && f.stops <= 1) return false;
      return true;
    })
    .filter((f) => {
      if (selectedAirlines.length === 0) return true;
      return selectedAirlines.includes(f.airline_name);
    })
    .filter((f) => {
      if (!maxDuration) return true;
      if (!f.duration_minutes) return true;
      return f.duration_minutes <= maxDuration;
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === 'quickest') {
        return (a.duration_minutes || 0) - (b.duration_minutes || 0);
      }
      // cheapest
      return Number(a.ticket_price) - Number(b.ticket_price);
    });

  const toggleFavorite = (flightId) => {
    setFavorites((prev) =>
      prev.includes(flightId) ? prev.filter((id) => id !== flightId) : [...prev, flightId]
    );
  };

  if (loading) return <main className="main-content">Loading...</main>;
  if (error) return <main className="main-content">Error: {error}</main>;

  return (
    <main className="main-content results-layout">
      <aside className="results-filters">
        <h4>Filters</h4>
        <div className="filter-group">
          <h5>Stops</h5>
          <label>
            <input
              type="radio"
              name="stops"
              checked={selectedStops === 'any'}
              onChange={() => setSelectedStops('any')}
            />
            Any
          </label>
          <label>
            <input
              type="radio"
              name="stops"
              checked={selectedStops === 'nonstop'}
              onChange={() => setSelectedStops('nonstop')}
            />
            Nonstop
          </label>
          <label>
            <input
              type="radio"
              name="stops"
              checked={selectedStops === 'onestop'}
              onChange={() => setSelectedStops('onestop')}
            />
            1 stop
          </label>
          <label>
            <input
              type="radio"
              name="stops"
              checked={selectedStops === 'twoplus'}
              onChange={() => setSelectedStops('twoplus')}
            />
            2+ stops
          </label>
        </div>

        <div className="filter-group">
          <h5>Airlines</h5>
          {allAirlines.map((name) => (
            <label key={name}>
              <input
                type="checkbox"
                checked={selectedAirlines.includes(name)}
                onChange={() => toggleAirline(name)}
              />
              {name}
            </label>
          ))}
          {allAirlines.length === 0 && <div className="filter-placeholder">No airlines</div>}
        </div>

        <div className="filter-group">
          <h5>Duration (max)</h5>
          <input
            type="range"
            min="0"
            max={maxDuration || 600}
            value={maxDuration || 0}
            onChange={(e) => setMaxDuration(Number(e.target.value))}
          />
          {maxDuration > 0 && (
            <div className="filter-caption">Up to {(maxDuration / 60).toFixed(1)} hours</div>
          )}
        </div>

        <div className="filter-group">
          <h5>Baggage</h5>
          <div className="filter-placeholder">Carry-on / checked (placeholder)</div>
        </div>

        <div className="filter-group">
          <h5>Cabin</h5>
          <div className="filter-placeholder">Economy / Business / First (placeholder)</div>
        </div>
      </aside>

      <section className="results-main">
        <form className="results-search-bar" onSubmit={onSubmitSearch}>
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            placeholder="From (SFO)"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            placeholder="To (JFK)"
          />
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
          <input
            type="date"
            value={returnDate}
            min={departureDate || undefined}
            onChange={(e) => setReturnDate(e.target.value)}
          />
          <select
            value={flightClass}
            onChange={(e) => setFlightClass(e.target.value)}
          >
            <option value="Economy">Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        <div className="results-header">
          <div>{filteredFlights.length} flights found</div>
          <div className="results-sort-tabs">
            <button
              type="button"
              className={sortBy === 'cheapest' ? 'sort-tab active' : 'sort-tab'}
              onClick={() => setSortBy('cheapest')}
            >
              Cheapest
            </button>
            <button
              type="button"
              className={sortBy === 'quickest' ? 'sort-tab active' : 'sort-tab'}
              onClick={() => setSortBy('quickest')}
            >
              Quickest
            </button>
          </div>
        </div>

        <div className="results-list">
          {filteredFlights.map((f) => (
            <div key={f.flight_id} className="flight-card">
              <div className="flight-card-main" onClick={() => navigate(`/flights/${f.flight_id}`)}>
                <div className="flight-card-airline">
                  <div className="flight-airline-name">{f.airline_name}</div>
                  <div className="flight-id">{f.flight_id}</div>
                </div>
                <div className="flight-card-times">
                  <div className="time-col">
                    <div className="time-label">Depart</div>
                    <div>{f.departure_airport}</div>
                  </div>
                  <div className="time-col">
                    <div className="time-label">Arrive</div>
                    <div>{f.arrival_airport}</div>
                  </div>
                  <div className="time-col">
                    <div className="time-label">Duration</div>
                    <div>
                      {f.duration_minutes
                        ? `${Math.floor(f.duration_minutes / 60)}h ${f.duration_minutes % 60}m`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="time-col">
                    <div className="time-label">Stops</div>
                    <div>
                      {f.stops === 0
                        ? 'Nonstop'
                        : f.stops === 1
                        ? '1 stop'
                        : `${f.stops} stops`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flight-card-side">
                <button
                  type="button"
                  className={
                    favorites.includes(f.flight_id) ? 'flight-favorite active' : 'flight-favorite'
                  }
                  onClick={() => toggleFavorite(f.flight_id)}
                >
                  {favorites.includes(f.flight_id) ? '❤' : '♡'}
                </button>
                <div className="flight-price">${Number(f.ticket_price).toFixed(2)}</div>
                <button
                  type="button"
                  className="select-btn"
                  onClick={() => navigate(`/booking/${f.flight_id}`)}
                >
                  Select
                </button>
              </div>
            </div>
          ))}
          {filteredFlights.length === 0 && <div>No flights match these filters.</div>}
        </div>
      </section>
    </main>
  );
};

export default SearchResultsPage;
