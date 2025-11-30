const { getMySqlPool } = require('../config/database');

async function createFlight(flightData) {
  const pool = await getMySqlPool();
  const [result] = await pool.query('INSERT INTO flights SET ?', flightData);
  return { ...flightData, flight_id: flightData.flight_id };
}

async function getFlightById(flightId) {
  const pool = await getMySqlPool();
  const [rows] = await pool.query(
    'SELECT * FROM flights WHERE flight_id = ? AND is_deleted = 0',
    [flightId]
  );
  return rows[0] || null;
}

function buildSearchQuery(filters) {
  const conditions = ['is_deleted = 0'];
  const params = [];

  if (filters.origin) {
    conditions.push('departure_airport = ?');
    params.push(filters.origin);
  }
  if (filters.destination) {
    conditions.push('arrival_airport = ?');
    params.push(filters.destination);
  }
  if (filters.departureDate) {
    conditions.push('DATE(departure_datetime) = ?');
    params.push(filters.departureDate);
  }
  if (filters.flightClass) {
    conditions.push('flight_class = ?');
    params.push(filters.flightClass);
  }
  if (filters.minPrice) {
    conditions.push('ticket_price >= ?');
    params.push(filters.minPrice);
  }
  if (filters.maxPrice) {
    conditions.push('ticket_price <= ?');
    params.push(filters.maxPrice);
  }
  if (filters.maxStops !== undefined) {
    conditions.push('stops <= ?');
    params.push(filters.maxStops);
  }
  if (filters.departureTimeRange) {
    if (filters.departureTimeRange === 'morning') {
      conditions.push('TIME(departure_datetime) BETWEEN "06:00:00" AND "11:59:59"');
    } else if (filters.departureTimeRange === 'afternoon') {
      conditions.push('TIME(departure_datetime) BETWEEN "12:00:00" AND "17:59:59"');
    } else if (filters.departureTimeRange === 'evening') {
      conditions.push('TIME(departure_datetime) BETWEEN "18:00:00" AND "23:59:59"');
    } else if (filters.departureTimeRange === 'night') {
      conditions.push('TIME(departure_datetime) BETWEEN "00:00:00" AND "05:59:59"');
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM flights ${where} ORDER BY departure_datetime ASC LIMIT 200`;

  return { sql, params };
}

async function searchFlights(filters) {
  const pool = await getMySqlPool();
  const { sql, params } = buildSearchQuery(filters);
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function updateFlight(flightId, updateData) {
  const pool = await getMySqlPool();
  const [result] = await pool.query('UPDATE flights SET ? WHERE flight_id = ? AND is_deleted = 0', [
    updateData,
    flightId,
  ]);
  return result.affectedRows > 0;
}

async function updateAvailableSeats(flightId, seatsToDeduct) {
  const pool = await getMySqlPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT available_seats FROM flights WHERE flight_id = ? AND is_deleted = 0 FOR UPDATE',
      [flightId]
    );

    if (!rows.length) {
      await conn.rollback();
      return false;
    }

    const available = rows[0].available_seats;
    if (available < seatsToDeduct) {
      await conn.rollback();
      return false;
    }

    await conn.query(
      'UPDATE flights SET available_seats = available_seats - ? WHERE flight_id = ? AND is_deleted = 0',
      [seatsToDeduct, flightId]
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

async function deleteFlight(flightId) {
  const pool = await getMySqlPool();
  const [result] = await pool.query('UPDATE flights SET is_deleted = 1 WHERE flight_id = ?', [
    flightId,
  ]);
  return result.affectedRows > 0;
}

async function getPopularRoutes(limit = 10) {
  const pool = await getMySqlPool();
  const [rows] = await pool.query(
    `SELECT f.departure_airport, f.arrival_airport, COUNT(b.booking_id) AS booking_count
     FROM flights f
     JOIN flight_bookings b ON f.flight_id = b.flight_id
     WHERE f.is_deleted = 0
     GROUP BY f.departure_airport, f.arrival_airport
     ORDER BY booking_count DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

module.exports = {
  createFlight,
  getFlightById,
  searchFlights,
  updateFlight,
  updateAvailableSeats,
  deleteFlight,
  getPopularRoutes,
};
