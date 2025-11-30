const mongoose = require('mongoose');
const { connectMongo } = require('../config/database');

const flightReviewSchema = new mongoose.Schema(
  {
    review_id: { type: String, required: true, unique: true },
    flight_id: { type: String, required: true },
    user_id: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

let ReviewModel;

async function getReviewModel() {
  if (!ReviewModel) {
    await connectMongo();
    ReviewModel = mongoose.models.FlightReview ||
      mongoose.model('FlightReview', flightReviewSchema, 'flight_reviews');
  }
  return ReviewModel;
}

async function createReview(reviewData) {
  const Model = await getReviewModel();
  const doc = new Model(reviewData);
  return doc.save();
}

async function getReviewsByFlightId(flightId) {
  const Model = await getReviewModel();
  return Model.find({ flight_id: flightId }).sort({ created_at: -1 }).lean();
}

async function updateReview(reviewId, updateData) {
  const Model = await getReviewModel();
  return Model.findOneAndUpdate(
    { review_id: reviewId },
    { $set: updateData },
    { new: true }
  ).lean();
}

async function deleteReview(reviewId) {
  const Model = await getReviewModel();
  const res = await Model.deleteOne({ review_id: reviewId });
  return res.deletedCount > 0;
}

async function calculateAverageRating(flightId) {
  const Model = await getReviewModel();
  const result = await Model.aggregate([
    { $match: { flight_id: flightId } },
    {
      $group: {
        _id: '$flight_id',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) {
    return { averageRating: 0, count: 0 };
  }

  return {
    averageRating: Number(result[0].avgRating.toFixed(2)),
    count: result[0].count,
  };
}

module.exports = {
  createReview,
  getReviewsByFlightId,
  updateReview,
  deleteReview,
  calculateAverageRating,
};
