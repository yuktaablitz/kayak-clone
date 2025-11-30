import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../services/flightService';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [bookings, setBookings] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!user) return;
    getUserBookings(user.userId)
      .then((res) => setBookings(res.data || []))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <main className="main-content">Loading...</main>;
  if (error) return <main className="main-content">Error: {error}</main>;

  return (
    <main className="main-content">
      <h2>My trips</h2>
      {bookings.map((b) => (
        <div
          key={b.booking_id}
          style={{
            background: '#fff',
            margin: '0.5rem 0',
            padding: '1rem',
            borderRadius: 8,
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/bookings/${b.booking_id}`)}
        >
          <div>Booking: {b.booking_id}</div>
          <div>Flight: {b.flight_id}</div>
          <div>Status: {b.booking_status}</div>
        </div>
      ))}
      {bookings.length === 0 && <p>No bookings yet.</p>}
    </main>
  );
};

export default MyBookingsPage;
