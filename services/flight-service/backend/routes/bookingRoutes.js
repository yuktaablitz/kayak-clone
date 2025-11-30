const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/flightValidation');

router.post('/flights/:flightId/book', validateBooking, bookingController.createBooking);
router.get('/:bookingId', bookingController.getBooking);
router.get('/user/:userId', bookingController.getUserBookings);
router.post('/:bookingId/cancel', bookingController.cancelBooking);

module.exports = router;
