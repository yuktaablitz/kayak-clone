import React from 'react';
import { useParams } from 'react-router-dom';
import { getFlightDetails, getFlightReviews, submitReview } from '../services/flightService';
import { useAuth } from '../context/AuthContext';

const FlightDetailsPage = () => {
  const { flightId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState('');

  const [reviews, setReviews] = React.useState([]);
  const [ratingSummary, setRatingSummary] = React.useState(null);

  const [newRating, setNewRating] = React.useState(5);
  const [newComment, setNewComment] = React.useState('');
  const [submitError, setSubmitError] = React.useState('');
  const [submitMessage, setSubmitMessage] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    Promise.all([getFlightDetails(flightId), getFlightReviews(flightId)])
      .then(([detailsRes, reviewsRes]) => {
        setData(detailsRes.data);
        setReviews(reviewsRes.data?.data || []);
        setRatingSummary(detailsRes.data?.rating || null);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [flightId]);

  if (loading) return <main className="main-content">Loading...</main>;
  if (error) return <main className="main-content">Error: {error}</main>;
  if (!data) return <main className="main-content">Not found</main>;

  const { flight } = data;

  const averageRating = ratingSummary?.averageRating || 0;
  const reviewCount = ratingSummary?.count || reviews.length || 0;

  const onSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitMessage('');

    if (!user) {
      setSubmitError('You must be logged in to leave a review.');
      return;
    }

    if (!newComment.trim()) {
      setSubmitError('Please enter a comment.');
      return;
    }

    try {
      const payload = {
        review_id: `RV-${Date.now()}`,
        user_id: user.userId,
        rating: Number(newRating),
        comment: newComment.trim(),
      };
      const res = await submitReview(flightId, payload);
      const created = res.data?.data || payload;
      setReviews((prev) => [created, ...prev]);
      setSubmitMessage('Review submitted.');
      setNewComment('');
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    }
  };

  return (
    <main className="main-content">
      <h2>
        {flight.airline_name} {flight.flight_id}
      </h2>
      <p>
        {flight.departure_airport} → {flight.arrival_airport}
      </p>
      <p>Class: {flight.flight_class}</p>
      <p>Price: ${flight.ticket_price}</p>
      <p>
        Rating: {averageRating.toFixed(1)} ({reviewCount} reviews)
      </p>

      <section className="booking-step" style={{ maxWidth: 700, marginTop: '1rem' }}>
        <h3>Passenger reviews</h3>
        {reviews.length === 0 && <p>No reviews yet. Be the first to review this flight.</p>}
        {reviews.length > 0 && (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {reviews.map((r) => (
              <li
                key={r.review_id}
                style={{
                  borderBottom: '1px solid #eceff1',
                  padding: '0.5rem 0',
                }}
              >
                <div style={{ fontWeight: 600 }}>Rating: {r.rating}/5</div>
                <div style={{ fontSize: '0.9rem' }}>{r.comment}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="booking-step" style={{ maxWidth: 700, marginTop: '1rem' }}>
        <h3>Leave a review</h3>
        <form onSubmit={onSubmitReview} className="passenger-form">
          <div className="field">
            <label>Rating</label>
            <select value={newRating} onChange={(e) => setNewRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((v) => (
                <option key={v} value={v}>
                  {v} stars
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Comment</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="primary-btn">
            Submit review
          </button>
        </form>
        {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
        {submitMessage && <p>{submitMessage}</p>}
      </section>
    </main>
  );
};

export default FlightDetailsPage;
