import React from 'react';
import { useParams } from 'react-router-dom';
import { getBookingById, getFlightDetails } from '../services/flightService';

const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = React.useState(null);
  const [flight, setFlight] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const bookingRes = await getBookingById(bookingId);
        const b = bookingRes.data;
        if (!mounted) return;
        setBooking(b);
        if (b) {
          const flightRes = await getFlightDetails(b.flight_id);
          if (!mounted) return;
          setFlight(flightRes.data?.flight || null);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [bookingId]);

  if (loading) return <main className="main-content">Loading...</main>;
  if (error) return <main className="main-content">Error: {error}</main>;
  if (!booking) return <main className="main-content">Booking not found</main>;

  const totalAmount = Number(booking.total_amount) || 0;

  return (
    <main className="main-content">
      <h2>Booking details</h2>
      <div className="booking-step" style={{ maxWidth: 700 }}>
        <div><strong>Booking ID:</strong> {booking.booking_id}</div>
        <div><strong>Status:</strong> {booking.booking_status}</div>
        <div><strong>Passenger name:</strong> {booking.passenger_name}</div>
        <div><strong>Email:</strong> {booking.passenger_email}</div>
        <div><strong>Phone:</strong> {booking.passenger_phone}</div>
        <div><strong>Flight:</strong> {booking.flight_id}</div>
        {flight && (
          <div style={{ marginTop: '0.5rem' }}>
            <div>{flight.departure_airport} → {flight.arrival_airport}</div>
            <div>{flight.airline_name} {flight.flight_id}</div>
            <div>Class: {flight.flight_class}</div>
          </div>
        )}
        <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>
          Total paid: ${totalAmount.toFixed(2)}
        </div>
      </div>
    </main>
  );
};

export default BookingDetailsPage;
