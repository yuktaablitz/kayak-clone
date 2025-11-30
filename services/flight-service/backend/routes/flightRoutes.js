const express = require('express');
const router = express.Router();

const flightController = require('../controllers/flightController');
const reviewController = require('../controllers/reviewController');
const { cache } = require('../middleware/cacheMiddleware');
const {
  validateSearchQuery,
  validateFlight,
  validateReview,
} = require('../middleware/flightValidation');

// Search flights with caching
router.get('/search', validateSearchQuery, cache(300), flightController.searchFlights);

// Flight details with caching
router.get('/:flightId', cache(600), flightController.getFlightDetails);

// Admin flight CRUD (auth not implemented yet)
router.post('/', validateFlight, flightController.createFlight);
router.put('/:flightId', flightController.updateFlight);
router.delete('/:flightId', flightController.deleteFlight);

// Reviews for a flight
router.post('/:flightId/reviews', validateReview, reviewController.submitReview);
router.get('/:flightId/reviews', cache(300), reviewController.getReviews);

module.exports = router;
