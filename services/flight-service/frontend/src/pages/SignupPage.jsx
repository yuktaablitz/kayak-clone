import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Please enter your name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Mock signup -> login
    login({ userId: '123-45-6789', name });
    navigate('/');
  };

  return (
    <main className="main-content">
      <h2>Create your account</h2>
      <div className="booking-step" style={{ maxWidth: 420 }}>
        <form onSubmit={onSubmit} className="passenger-form">
          <div className="field">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="primary-btn">
            Sign up
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p style={{ marginTop: '0.75rem' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
};

export default SignupPage;
