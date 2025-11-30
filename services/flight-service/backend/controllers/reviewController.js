const reviewModel = require('../models/flightReviewModel');
const { sendMessage } = require('../services/kafkaProducer');

async function submitReview(req, res) {
  try {
    const { flightId } = req.params;
    const body = req.body;

    const reviewData = {
      review_id: body.review_id,
      flight_id: flightId,
      user_id: body.user_id,
      rating: body.rating,
      comment: body.comment,
    };

    const created = await reviewModel.createReview(reviewData);

    try {
      await sendMessage('flight-review-created', {
        review_id: created.review_id || reviewData.review_id,
        flight_id: flightId,
        user_id: reviewData.user_id,
        rating: reviewData.rating,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      // log only; don't break review creation if Kafka is down
      // eslint-disable-next-line no-console
      console.error('Failed to send Kafka review-created event', err.message);
    }

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getReviews(req, res) {
  try {
    const { flightId } = req.params;
    const reviews = await reviewModel.getReviewsByFlightId(flightId);
    return res.json({ success: true, data: reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateReview(req, res) {
  try {
    const { reviewId } = req.params;
    const updated = await reviewModel.updateReview(reviewId, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteReview(req, res) {
  try {
    const { reviewId } = req.params;
    const ok = await reviewModel.deleteReview(reviewId);

    if (!ok) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    return res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  submitReview,
  getReviews,
  updateReview,
  deleteReview,
};
