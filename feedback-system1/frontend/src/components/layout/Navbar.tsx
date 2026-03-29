import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoError, setLogoError] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        {/* Try to load image, fallback to CSS if fails */}
        {!logoError ? (
          <img 
            src="/images.jpg"   // ✅ corrected path
            alt="Logo" 
            style={styles.logoImage}
            onError={() => setLogoError(true)}
          />
        ) : (
          <div style={styles.logoCircle}>
            <span style={styles.logoIcon}>📝</span>
          </div>
        )}
        <h2 style={styles.logoText}>Feedback System</h2>
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>🏠 Home</Link>
        <Link to="/form" style={styles.link}>📋 Feedback Form</Link>
        {user && user.role === 'admin' && (
          <>
            <Link to="/questions" style={styles.link}>✏️ Edit Questions</Link>
            <Link to="/list" style={styles.link}>📊 All Feedbacks</Link>
            <Link to="/admin" style={styles.link}>📈 Dashboard</Link>
          </>
        )}
        {!user ? (
          <Link to="/login" style={styles.link}>🔐 Sign In</Link>
        ) : (
          <>
            <span style={styles.userName}>👤 {user.username}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>🚪 Sign Out</button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    backgroundColor: '#007bff',
    padding: '0.75rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoImage: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    backgroundColor: 'white',
  },
  logoCircle: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    border: '2px solid white',
  },
  logoIcon: {
    fontSize: '1.8rem',
    color: '#007bff',
  },
  logoText: {
    color: 'white',
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem',
    fontSize: '0.95rem',
    transition: 'opacity 0.2s',
    borderRadius: '4px',
  },
  userName: {
    color: 'white',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '20px',
    fontSize: '0.9rem',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '0.5rem',
    fontSize: '0.95rem',
    transition: 'opacity 0.2s',
    borderRadius: '4px',
  },
};

export default Navbar;
