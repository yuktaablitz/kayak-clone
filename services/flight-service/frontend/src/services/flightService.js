import api from './api';

export async function searchFlights(params) {
  const response = await api.get('/flights/search', { params });
  return response.data;
}

export async function getFlightDetails(flightId) {
  const response = await api.get(`/flights/${flightId}`);
  return response.data;
}

export async function getFlightReviews(flightId) {
  const response = await api.get(`/flights/${flightId}/reviews`);
  return response.data;
}

export async function createBooking(flightId, bookingData) {
  const response = await api.post(`/bookings/flights/${flightId}/book`, bookingData);
  return response.data;
}

export async function getUserBookings(userId) {
  const response = await api.get(`/bookings/user/${userId}`);
  return response.data;
}

export async function cancelBooking(bookingId) {
  const response = await api.post(`/bookings/${bookingId}/cancel`);
  return response.data;
}

export async function submitReview(flightId, reviewData) {
  const response = await api.post(`/flights/${flightId}/reviews`, reviewData);
  return response.data;
}

export async function getBookingById(bookingId) {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
}
