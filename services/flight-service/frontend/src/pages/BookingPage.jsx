import React from 'react';
import { useParams } from 'react-router-dom';
import { createBooking, getFlightDetails } from '../services/flightService';
import { useAuth } from '../context/AuthContext';

const PROVIDERS = [
  { id: 'kiwi', name: 'Kiwi.com', priceMultiplier: 1.0 },
  { id: 'cheapair', name: 'CheapAir', priceMultiplier: 1.1 },
  { id: 'booking', name: 'Booking.com Flights', priceMultiplier: 1.15 },
];

const BookingPage = () => {
  const { flightId } = useParams();
  const { user } = useAuth();

  const [step, setStep] = React.useState(1);
  const [flight, setFlight] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [selectedProvider, setSelectedProvider] = React.useState(PROVIDERS[0]);
  const [providerPrice, setProviderPrice] = React.useState(0);

  const [passengerCount, setPassengerCount] = React.useState(1);
  const [passengers, setPassengers] = React.useState([
    { name: user?.name || '', age: '', email: '', phone: '' },
  ]);

  const [message, setMessage] = React.useState('');
  const [validationError, setValidationError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    getFlightDetails(flightId)
      .then((res) => {
        const f = res.data?.flight;
        setFlight(f);
        if (f) {
          const base = Number(f.ticket_price) || 0;
          setProviderPrice(base * PROVIDERS[0].priceMultiplier);
        }
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [flightId]);

  const onSelectProvider = (provider) => {
    setSelectedProvider(provider);
    const base = Number(flight.ticket_price) || 0;
    setProviderPrice(base * provider.priceMultiplier);
    setStep(3);
  };

  const onPassengerCountChange = (e) => {
    const count = Number(e.target.value) || 1;
    setPassengerCount(count);
    setPassengers((prev) => {
      const copy = [...prev];
      while (copy.length < count) {
        copy.push({ name: '', age: '', email: '', phone: '' });
      }
      return copy.slice(0, count);
    });
  };

  const updatePassenger = (index, field, value) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const onSubmitBooking = async (e) => {
    e.preventDefault();
    setMessage('');
    setValidationError('');

    if (!flight) return;

    const seatsRequested = passengerCount || 1;

    const primary = passengers[0];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(primary.email)) {
      setValidationError('Please enter a valid email address for Passenger 1.');
      return;
    }

    for (let i = 0; i < passengers.length; i += 1) {
      const p = passengers[i];
      const digitsOnlyPhone = (p.phone || '').replace(/\D/g, '');
      if (digitsOnlyPhone.length !== 10) {
        setValidationError(`Phone number for Passenger ${i + 1} must be exactly 10 digits.`);
        return;
      }
      if (!p.name || !p.age || !p.email || !p.phone) {
        setValidationError(`Please fill in all details for Passenger ${i + 1}.`);
        return;
      }
    }

    const totalAmount = providerPrice * seatsRequested;

    try {
      const payload = {
        booking_id: `BK-${Date.now()}`,
        user_id: user.userId,
        passenger_name: primary.name,
        passenger_email: primary.email,
        passenger_phone: primary.phone,
        seat_number: '',
        passenger_count: seatsRequested,
        unit_price: providerPrice,
        total_amount: totalAmount,
        booking_status: 'Confirmed',
      };

      const res = await createBooking(flightId, payload);
      setMessage(`Booking created: ${res.data.booking_id || payload.booking_id}`);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <main className="main-content">Loading...</main>;
  if (error) return <main className="main-content">Error: {error}</main>;
  if (!flight) return <main className="main-content">Flight not found</main>;

  const basePrice = Number(flight.ticket_price) || 0;
  const seatsRequested = passengerCount || 1;
  const totalPrice = providerPrice * seatsRequested;

  return (
    <main className="main-content booking-layout">
      <section className="booking-main">
        <h2>Review and book</h2>

        {/* Step 1: fare details */}
        <div className="booking-step">
          <h3>Step 1: Review what's included</h3>
          <div className="fare-card">
            <div className="fare-header">
              <div>Basic</div>
              <div className="fare-price">${basePrice.toFixed(2)}</div>
            </div>
            <ul className="fare-list">
              <li>Carry-on bag: may be extra</li>
              <li>Checked bag: fees may apply</li>
              <li>Seat selection: not guaranteed</li>
              <li>Changes and refunds may be limited</li>
            </ul>
            <div className="fare-meta">Available seats: {flight.available_seats}</div>
          </div>
        </div>

        {/* Step 2: choose provider */}
        <div className="booking-step">
          <h3>Step 2: Choose where to book</h3>
          <div className="provider-list">
            {PROVIDERS.map((p) => {
              const price = basePrice * p.priceMultiplier;
              return (
                <div key={p.id} className="provider-card">
                  <div>
                    <div className="provider-name">{p.name}</div>
                    <div className="provider-note">Same itinerary, different pricing</div>
                  </div>
                  <div className="provider-actions">
                    <div className="provider-price">${price.toFixed(2)}</div>
                    <button
                      type="button"
                      className="select-btn"
                      onClick={() => onSelectProvider(p)}
                    >
                      Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: passenger details */}
        <div className="booking-step">
          <h3>Step 3: Passenger details</h3>
          <form onSubmit={onSubmitBooking} className="passenger-form">
            <div className="field">
              <label>Number of passengers</label>
              <select value={passengerCount} onChange={onPassengerCountChange}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {passengers.map((p, idx) => (
              <div key={idx} className="passenger-card">
                <div className="passenger-title">Passenger {idx + 1}</div>
                <div className="field">
                  <label>Name</label>
                  <input
                    value={p.name}
                    onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Age</label>
                  <input
                    type="number"
                    value={p.age}
                    onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    value={p.email}
                    onChange={(e) => updatePassenger(idx, 'email', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    value={p.phone}
                    onChange={(e) => updatePassenger(idx, 'phone', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button type="submit" className="primary-btn">
              Confirm booking
            </button>
          </form>
          {validationError && <p style={{ color: 'red' }}>{validationError}</p>}
          {message && <p>{message}</p>}
        </div>
      </section>

      <aside className="booking-summary">
        <h4>Trip summary</h4>
        <div className="summary-card">
          <div>{flight.departure_airport} → {flight.arrival_airport}</div>
          <div>{flight.airline_name} {flight.flight_id}</div>
          <div>Class: {flight.flight_class}</div>
          <div>Passengers: {seatsRequested}</div>
          <div>Base fare: ${basePrice.toFixed(2)}</div>
          <div>Selected provider: {selectedProvider.name}</div>
          <div>Per-passenger price: ${providerPrice.toFixed(2)}</div>
          <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>
            Total: ${totalPrice.toFixed(2)}
          </div>
        </div>
      </aside>
    </main>
  );
};

export default BookingPage;
