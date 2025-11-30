import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightSearch.css';

const FlightSearch = () => {
  const navigate = useNavigate();

  const [tripType, setTripType] = React.useState('oneway');
  const [origin, setOrigin] = React.useState('SFO');
  const [destination, setDestination] = React.useState('JFK');
  const [departureDate, setDepartureDate] = React.useState('2025-12-15');
  const [returnDate, setReturnDate] = React.useState('');
  const [passengers, setPassengers] = React.useState(1);
  const [flightClass, setFlightClass] = React.useState('Economy');

  const onSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      class: flightClass,
    });

    if (tripType === 'roundtrip' && returnDate) {
      params.set('returnDate', returnDate);
    }

    // passengers is not used in the backend yet but we keep it in the URL for future use
    params.set('passengers', String(passengers));

    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="trip-type-tabs">
          <button
            type="button"
            className={tripType === 'oneway' ? 'tab active' : 'tab'}
            onClick={() => setTripType('oneway')}
          >
            One-way
          </button>
          <button
            type="button"
            className={tripType === 'roundtrip' ? 'tab active' : 'tab'}
            onClick={() => setTripType('roundtrip')}
          >
            Round-trip
          </button>
        </div>

        <form onSubmit={onSubmit} className="flight-search-bar">
          <div className="segment">
            <label>From</label>
            <input
              value={origin}
              placeholder="SFO"
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            />
          </div>
          <div className="segment">
            <label>To</label>
            <input
              value={destination}
              placeholder="JFK"
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
            />
          </div>
          <div className="segment">
            <label>Depart</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>
          <div className="segment">
            <label>Return</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate || undefined}
              disabled={tripType === 'oneway'}
            />
          </div>
          <div className="segment">
            <label>Passengers</label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'adult' : 'travelers'}
                </option>
              ))}
            </select>
          </div>
          <div className="segment">
            <label>Class</label>
            <select
              value={flightClass}
              onChange={(e) => setFlightClass(e.target.value)}
            >
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </div>
          <div className="segment action-segment">
            <button type="submit" className="search-btn">
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default FlightSearch;
