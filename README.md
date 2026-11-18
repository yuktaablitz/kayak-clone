# Kayak Clone: Flight Service

The flight part of a Kayak-style travel booking system: a React single-page app for searching and booking flights,
backed by a Node.js/Express REST service that uses MySQL for flights and bookings, MongoDB for reviews, Redis for
response caching, and Kafka for asynchronous search and booking requests.

## Architecture

```
React SPA (8 pages, React Router, MUI, Axios)
      │  REST /api/...
      ▼
Express flight-service (port 3002)
  ├─ Joi validation ── flights, bookings, reviews
  ├─ Redis cache ───── search 5 min, flight details 10 min, reviews 5 min (TTL)
  ├─ MySQL ─────────── flights, flight_bookings (keys, foreign key, 10 indexes)
  ├─ MongoDB ───────── flight_reviews
  └─ Kafka ─────────── consumes flight-search-request / flight-booking-request,
                       replies on flight-search-response / flight-booking-response
```

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/api/flights/search?origin=SFO&destination=JFK&departureDate=2027-01-03` | search (optional: `class`, `minPrice`, `maxPrice`, `maxStops`, `timeOfDay`) |
| GET | `/api/flights/:flightId` | flight details |
| POST | `/api/flights` | create a flight |
| PUT | `/api/flights/:flightId` | update a flight |
| DELETE | `/api/flights/:flightId` | soft-delete a flight |
| POST | `/api/flights/:flightId/reviews` | add a review |
| GET | `/api/flights/:flightId/reviews` | list reviews |
| PUT / DELETE | `/api/reviews/:reviewId` | edit / delete a review |
| POST | `/api/bookings/flights/:flightId/book` | book a flight |
| GET | `/api/bookings/:bookingId` | booking details |
| GET | `/api/bookings/user/:userId` | a user's bookings |
| POST | `/api/bookings/:bookingId/cancel` | cancel a booking |
| GET | `/health` | health check |

`user_id` uses the course project's ID format `###-##-####` (for example `123-45-6789`).

## Run it locally

Requires Node.js 18+ and Docker (for MySQL, MongoDB, Redis and Kafka).

```bash
git clone https://github.com/yuktaablitz/kayak-clone.git
cd kayak-clone

# 1. Databases, cache and Kafka. MySQL loads scripts/flight-schema.sql and 56 sample flights
#    (scripts/seed-flights.sql, Jan 1-7 2027) on first start.
docker compose up -d

# 2. Backend
cd services/flight-service/backend
cp .env.example .env
npm install
npm run dev                         # http://localhost:3002/health

# 3. Frontend (new terminal)
cd services/flight-service/frontend
cp .env.example .env
npm install
npm start                           # http://localhost:3000
```

Try a search: SFO → JFK on 2027-01-03, or

```bash
curl "http://localhost:3002/api/flights/search?origin=SFO&destination=JFK&departureDate=2027-01-03"
```

Kafka is optional: if it isn't running, the service logs a warning and keeps serving the REST API.

Using local installs instead of Docker? Create the database with `mysql -u root -p < scripts/flight-schema.sql`,
load `scripts/seed-flights.sql` the same way, and set the connection values in `backend/.env`.

## Frontend pages

Home, search results, flight details, booking, booking details, my bookings, login and sign-up. Login state lives in a
React Context (`src/context/AuthContext.jsx`) on the client; there is no auth service in this repo.

## Repo layout

```
services/flight-service/backend/    Express API: routes, controllers, models, middleware (cache, validation), Kafka
services/flight-service/frontend/   React app: pages, components, API client
scripts/flight-schema.sql           MySQL schema and indexes
scripts/seed-flights.sql            sample flights
flights/                            experimental FastAPI scraper for live Kayak results (not used by the app;
                                    page selectors change often, and check the site's terms before using it)
docker-compose.yml                  MySQL, MongoDB, Redis, Kafka
```

## Tech stack

React 18, React Router, Material UI, Axios · Node.js, Express, Joi, Winston · MySQL (mysql2), MongoDB (Mongoose),
Redis (ioredis), Kafka (kafkajs) · Docker Compose.
