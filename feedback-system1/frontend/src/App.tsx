import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import DynamicFeedbackForm from './components/feedback/DynamicFeedbackForm';
import FeedbackList from './components/feedback/FeedbackList';
import AdminDashboard from './components/admin/AdminDashboard';
import QuestionEditor from './components/admin/QuestionEditor';
import Navbar from './components/layout/Navbar';
import { QRCodeSVG } from 'qrcode.react';

const Home: React.FC = () => {
  const formUrl = `${window.location.origin}/form`;

  return (
    <div style={styles.home}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📝 Feedback System</h1>
        <p style={styles.heroSubtitle}>Your voice matters. Share your thoughts with us!</p>
      </div>

      <div style={styles.qrSection}>
        <h2 style={styles.sectionTitle}>Scan to Give Feedback</h2>
        <div style={styles.qrCard}>
          <div style={styles.decorations}>🚀 📣 ⭐</div>
          <QRCodeSVG value={formUrl} size={200} bgColor="white" fgColor="#0072ff" />
          <p style={styles.qrText}>Scan with your phone camera</p>
          <p style={styles.qrUrl}>{formUrl}</p>
        </div>
      </div>

      <div style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>📱</div>
          <h3>Mobile Friendly</h3>
          <p>Scan the QR code to submit feedback from your phone</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🔒</div>
          <h3>Secure & Private</h3>
          <p>Your feedback is securely stored and anonymous</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>📊</div>
          <h3>Real-time Analytics</h3>
          <p>Admins can view statistics and insights instantly</p>
        </div>
      </div>

      <div style={styles.ctaSection}>
        <p>Ready to give feedback?</p>
        <a href="/form" style={styles.ctaButton}>Submit Feedback →</a>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<DynamicFeedbackForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/list" element={<ProtectedRoute requireAdmin><FeedbackList /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/questions" element={<ProtectedRoute requireAdmin><QuestionEditor /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  home: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  heroTitle: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    fontSize: '1.125rem',
    color: '#666',
  },
  qrSection: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#0072ff',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  qrCard: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  decorations: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  qrText: {
    marginTop: '1rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#f0f8ff',
  },
  qrUrl: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    color: '#e0e0e0',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  featureCard: {
    textAlign: 'center',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  ctaSection: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#f0f8ff',
    borderRadius: '12px',
  },
  ctaButton: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 2rem',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 500,
  },
};

export default App;
