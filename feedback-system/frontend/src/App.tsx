import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Navbar from './components/Navbar';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { QRCodeSVG } from 'qrcode.react';   // ✅ named import, not default

// Home component with QR code
const Home: React.FC = () => {
  const formUrl = `${window.location.origin}/form`;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Feedback System</h1>
      <p>Scan the QR code below to submit feedback on your phone:</p>
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <QRCodeSVG value={formUrl} size={200} />
      </div>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Or <a href="/form">click here</a> to fill out the form.
      </p>
    </div>
  );
};

// Protected route guard (only admin)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, role } = useAuth();
  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<FeedbackForm />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <FeedbackList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;