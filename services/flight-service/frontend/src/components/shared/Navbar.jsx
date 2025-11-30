import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          Kayak Flights
        </Link>
      </div>
      <div className="navbar-right">
        <Link to="/search" className="navbar-link">
          Search
        </Link>
        <Link to="/my-bookings" className="navbar-link">
          My Trips
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
