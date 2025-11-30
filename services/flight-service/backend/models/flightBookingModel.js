const { getMySqlPool } = require('../config/database');

async function createBooking(bookingData) {
  const pool = await getMySqlPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [flightRows] = await conn.query(
      'SELECT available_seats, ticket_price FROM flights WHERE flight_id = ? AND is_deleted = 0 FOR UPDATE',
      [bookingData.flight_id]
    );

    if (!flightRows.length) {
      await conn.rollback();
      return { success: false, reason: 'FLIGHT_NOT_FOUND' };
    }

    const flight = flightRows[0];

    const seatsRequested = bookingData.passenger_count && bookingData.passenger_count > 0
      ? bookingData.passenger_count
      : 1;

    if (flight.available_seats < seatsRequested) {
      await conn.rollback();
      return { success: false, reason: 'NO_SEATS_AVAILABLE' };
    }

    const unitPrice = bookingData.unit_price ?? flight.ticket_price;
    const totalAmount = bookingData.total_amount ?? unitPrice * seatsRequested;

    const seatNumber = bookingData.seat_number && String(bookingData.seat_number).trim()
      ? bookingData.seat_number
      : 'AUTO';

    const record = {
      booking_id: bookingData.booking_id,
      user_id: bookingData.user_id,
      flight_id: bookingData.flight_id,
      passenger_name: bookingData.passenger_name,
      passenger_email: bookingData.passenger_email,
      passenger_phone: bookingData.passenger_phone,
      seat_number: seatNumber,
      booking_date: bookingData.booking_date,
      total_amount: totalAmount,
      booking_status: bookingData.booking_status || 'Pending',
    };

    await conn.query('INSERT INTO flight_bookings SET ?', record);

    await conn.query(
      'UPDATE flights SET available_seats = available_seats - ? WHERE flight_id = ?',
      [seatsRequested, bookingData.flight_id]
    );

    await conn.commit();
    return { success: true, data: record };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getBookingById(bookingId) {
  const pool = await getMySqlPool();
  const [rows] = await pool.query('SELECT * FROM flight_bookings WHERE booking_id = ?', [
    bookingId,
  ]);
  return rows[0] || null;
}

async function getBookingsByUserId(userId) {
  const pool = await getMySqlPool();
  const [rows] = await pool.query('SELECT * FROM flight_bookings WHERE user_id = ?', [
    userId,
  ]);
  return rows;
}

async function updateBookingStatus(bookingId, status) {
  const pool = await getMySqlPool();
  const [result] = await pool.query(
    'UPDATE flight_bookings SET booking_status = ? WHERE booking_id = ?',
    [status, bookingId]
  );
  return result.affectedRows > 0;
}

async function cancelBooking(bookingId) {
  const pool = await getMySqlPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT flight_id, booking_status FROM flight_bookings WHERE booking_id = ? FOR UPDATE',
      [bookingId]
    );

    if (!rows.length) {
      await conn.rollback();
      return false;
    }

    const booking = rows[0];
    if (booking.booking_status === 'Cancelled') {
      await conn.rollback();
      return true;
    }

    await conn.query(
      'UPDATE flight_bookings SET booking_status = "Cancelled" WHERE booking_id = ?',
      [bookingId]
    );

    await conn.query(
      'UPDATE flights SET available_seats = available_seats + 1 WHERE flight_id = ?',
      [booking.flight_id]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  createBooking,
  getBookingById,
  getBookingsByUserId,
  updateBookingStatus,
  cancelBooking,
};
