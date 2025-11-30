const Joi = require('joi');

function validate(schema, source = 'query') {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    req[source] = value;
    next();
  };
}

const searchSchema = Joi.object({
  origin: Joi.string().length(3).uppercase().required(),
  destination: Joi.string().length(3).uppercase().required(),
  departureDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  returnDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  class: Joi.string().valid('Economy', 'Business', 'First').optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  maxStops: Joi.number().integer().min(0).max(3).optional(),
  timeOfDay: Joi.string()
    .valid('morning', 'afternoon', 'evening', 'night')
    .optional(),
});

const bookingSchema = Joi.object({
  booking_id: Joi.string().optional(),
  user_id: Joi.string().pattern(/^\d{3}-\d{2}-\d{4}$/).required(),
  passenger_name: Joi.string().min(2).max(100).required(),
  passenger_email: Joi.string().email().required(),
  passenger_phone: Joi.string().min(10).max(15).required(),
  seat_number: Joi.string().alphanum().max(10).allow('').optional(),
  passenger_count: Joi.number().integer().min(1).optional(),
  unit_price: Joi.number().min(0).optional(),
  total_amount: Joi.number().min(0).optional(),
  booking_status: Joi.string().optional(),
});

const flightSchema = Joi.object({
  flight_id: Joi.string().alphanum().min(4).max(8).required(),
  airline_name: Joi.string().required(),
  departure_airport: Joi.string().length(3).uppercase().required(),
  arrival_airport: Joi.string().length(3).uppercase().required(),
  departure_datetime: Joi.date().iso().required(),
  arrival_datetime: Joi.date().iso().greater(Joi.ref('departure_datetime')).required(),
  flight_class: Joi.string().valid('Economy', 'Business', 'First').required(),
  ticket_price: Joi.number().positive().required(),
  available_seats: Joi.number().integer().positive().required(),
  total_seats: Joi.number().integer().positive().required(),
  aircraft_type: Joi.string().optional(),
  stops: Joi.number().integer().min(0).max(3).optional(),
});

const reviewSchema = Joi.object({
  review_id: Joi.string().optional(),
  user_id: Joi.string().pattern(/^\d{3}-\d{2}-\d{4}$/).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).max(500).required(),
});

module.exports = {
  validateSearchQuery: validate(searchSchema, 'query'),
  validateBooking: validate(bookingSchema, 'body'),
  validateFlight: validate(flightSchema, 'body'),
  validateReview: validate(reviewSchema, 'body'),
};
