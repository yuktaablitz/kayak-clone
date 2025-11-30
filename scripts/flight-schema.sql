-- Flight Service MySQL Schema

CREATE DATABASE IF NOT EXISTS kayak_flights CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kayak_flights;

-- Flights table
CREATE TABLE IF NOT EXISTS flights (
  flight_id VARCHAR(50) PRIMARY KEY,
  airline_name VARCHAR(100) NOT NULL,
  departure_airport VARCHAR(10) NOT NULL,
  arrival_airport VARCHAR(10) NOT NULL,
  departure_datetime DATETIME NOT NULL,
  arrival_datetime DATETIME NOT NULL,
  duration_minutes INT NOT NULL,
  flight_class ENUM('Economy', 'Business', 'First') NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL,
  available_seats INT NOT NULL,
  total_seats INT NOT NULL,
  flight_rating DECIMAL(3,2) DEFAULT 0.00,
  aircraft_type VARCHAR(50),
  stops INT DEFAULT 0,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for flights
CREATE INDEX idx_flights_airline_name ON flights (airline_name);
CREATE INDEX idx_flights_departure_airport ON flights (departure_airport);
CREATE INDEX idx_flights_arrival_airport ON flights (arrival_airport);
CREATE INDEX idx_flights_departure_datetime ON flights (departure_datetime);
CREATE INDEX idx_flights_ticket_price ON flights (ticket_price);
CREATE INDEX idx_flights_flight_class ON flights (flight_class);

-- Flight bookings
CREATE TABLE IF NOT EXISTS flight_bookings (
  booking_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(11) NOT NULL,
  flight_id VARCHAR(50) NOT NULL,
  passenger_name VARCHAR(200) NOT NULL,
  passenger_email VARCHAR(100) NOT NULL,
  passenger_phone VARCHAR(20) NOT NULL,
  seat_number VARCHAR(10),
  booking_date DATETIME NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_flight_bookings_flight
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for flight_bookings
CREATE INDEX idx_flight_bookings_user_id ON flight_bookings (user_id);
CREATE INDEX idx_flight_bookings_flight_id ON flight_bookings (flight_id);
CREATE INDEX idx_flight_bookings_booking_status ON flight_bookings (booking_status);
CREATE INDEX idx_flight_bookings_booking_date ON flight_bookings (booking_date);
