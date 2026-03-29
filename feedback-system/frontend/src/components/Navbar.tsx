import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Navbar: React.FC = () => {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <img src="/images.jpg" alt="Logo" style={styles.logo} />
        <h2 style={styles.brand}>Feedback System</h2>
      </div>
      <div>
        <Link to="/" style={styles.link}>Home (QR)</Link>
        <Link to="/form" style={styles.link}>Feedback Form</Link>
        {token && role === 'admin' && (
          <>
            <Link to="/list" style={styles.link}>All Feedbacks</Link>
            <Link to="/admin" style={styles.link}>Dashboard</Link>
          </>
        )}
        {!token ? (
          <Link to="/login" style={styles.link}>Sign In</Link>
        ) : (
          <button onClick={handleLogout} style={styles.linkButton}>Sign Out</button>
        )}
      </div>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    backgroundColor: '#4a90e2',
    padding: '0.5rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    flexWrap: 'wrap',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logo: {
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  brand: {
    margin: 0,
    fontSize: '1rem',
  },
  link: {
    color: 'white',
    marginLeft: '1rem',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    marginLeft: '1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
};

export default Navbar;