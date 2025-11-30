const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { validateReview } = require('../middleware/flightValidation');

router.put('/:reviewId', validateReview, reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
