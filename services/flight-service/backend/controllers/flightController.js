const flightModel = require('../models/flightModel');
const reviewModel = require('../models/flightReviewModel');
const { cache } = require('../middleware/cacheMiddleware');

async function searchFlights(req, res) {
  try {
    const filters = {
      origin: req.query.origin,
      destination: req.query.destination,
      departureDate: req.query.departureDate,
      flightClass: req.query.class,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      maxStops: req.query.maxStops,
      departureTimeRange: req.query.timeOfDay,
    };

    const flights = await flightModel.searchFlights(filters);
    return res.json({ success: true, data: flights, count: flights.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getFlightDetails(req, res) {
  try {
    const { flightId } = req.params;
    const flight = await flightModel.getFlightById(flightId);

    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    const reviews = await reviewModel.getReviewsByFlightId(flightId);
    const ratingInfo = await reviewModel.calculateAverageRating(flightId);

    return res.json({
      success: true,
      data: {
        flight,
        reviews,
        rating: ratingInfo,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function createFlight(req, res) {
  try {
    const flightData = req.body;

    // Derive duration in minutes if not provided
    if (!flightData.duration_minutes && flightData.departure_datetime && flightData.arrival_datetime) {
      const dep = new Date(flightData.departure_datetime);
      const arr = new Date(flightData.arrival_datetime);
      const diffMs = arr.getTime() - dep.getTime();
      if (!Number.isNaN(diffMs) && diffMs > 0) {
        flightData.duration_minutes = Math.round(diffMs / (1000 * 60));
      }
    }

    const created = await flightModel.createFlight(flightData);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateFlight(req, res) {
  try {
    const { flightId } = req.params;
    const updated = await flightModel.updateFlight(flightId, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    return res.json({ success: true, message: 'Flight updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteFlight(req, res) {
  try {
    const { flightId } = req.params;
    const deleted = await flightModel.deleteFlight(flightId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    return res.json({ success: true, message: 'Flight deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  searchFlights,
  getFlightDetails,
  createFlight,
  updateFlight,
  deleteFlight,
};
