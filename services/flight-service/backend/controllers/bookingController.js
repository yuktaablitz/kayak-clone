const bookingModel = require('../models/flightBookingModel');
const { sendMessage } = require('../services/kafkaProducer');

async function createBooking(req, res) {
  try {
    const { flightId } = req.params;
    const body = req.body;

    const bookingData = {
      booking_id: body.booking_id,
      user_id: body.user_id,
      flight_id: flightId,
      passenger_name: body.passenger_name,
      passenger_email: body.passenger_email,
      passenger_phone: body.passenger_phone,
      seat_number: body.seat_number,
      booking_date: new Date(),
      total_amount: body.total_amount,
      passenger_count: body.passenger_count,
      unit_price: body.unit_price,
      booking_status: body.booking_status,
    };

    const result = await bookingModel.createBooking(bookingData);

    if (!result.success) {
      try {
        await sendMessage('flight-booking-created', {
          booking_id: result.booking_id,
          flight_id: flightId,
          user_id: bookingData.user_id,
          passenger_count: bookingData.passenger_count,
          total_amount: bookingData.total_amount,
          status: bookingData.booking_status || 'Confirmed',
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        // Log only; don't fail the HTTP request if Kafka is down
        // eslint-disable-next-line no-console
        console.error('Failed to send Kafka booking-created event', err.message);
      }

      return res.status(400).json({ success: false, message: result.reason });
    }

    return res.status(201).json({ success: true, data: result.data, message: 'Booking created' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const booking = await bookingModel.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getUserBookings(req, res) {
  try {
    const { userId } = req.params;
    const bookings = await bookingModel.getBookingsByUserId(userId);
    return res.json({ success: true, data: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function cancelBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const ok = await bookingModel.cancelBooking(bookingId);

    if (!ok) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createBooking,
  getBooking,
  getUserBookings,
  cancelBooking,
};
