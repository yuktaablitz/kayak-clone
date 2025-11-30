import React from 'react';
import FlightSearch from '../components/FlightSearch/FlightSearch';

const HomePage = () => {
  return (
    <main className="main-content home-layout">
      <aside className="side-menu">
        <div className="side-menu-section">
          <div className="side-menu-item active">Flights</div>
          <div className="side-menu-item">Stays</div>
          <div className="side-menu-item">Cars</div>
          <div className="side-menu-item">Packages</div>
          <div className="side-menu-item">Trains & buses</div>
        </div>
        <div className="side-menu-section">
          <div className="side-menu-item">Trips</div>
          <div className="side-menu-item">Explore</div>
          <div className="side-menu-item">Flight Tracker</div>
        </div>
      </aside>
      <section className="home-main">
        <FlightSearch />
      </section>
    </main>
  );
};

export default HomePage;
