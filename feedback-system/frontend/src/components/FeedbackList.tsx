import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Feedback {
  id: number;
  rating: number;
  wordRating: string;
  topics: string[];
  createdAt: string;
}

const FeedbackList: React.FC = () => {
  const { token } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!token) return; // no token, cannot fetch (route guard will redirect anyway)
      try {
        const res = await axios.get<Feedback[]>('http://localhost:5000/api/feedback', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedbacks(res.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load feedbacks. You may need to log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [token]);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '1rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    th: {
      backgroundColor: '#4a90e2',
      color: 'white',
      padding: '0.75rem',
      textAlign: 'left',
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #ddd',
    },
    error: {
      color: 'red',
      textAlign: 'center',
      marginTop: '1rem',
    },
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <h2>All Feedback Submissions</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Numeric Rating</th>
              <th style={styles.th}>Word Rating</th>
              <th style={styles.th}>Topics</th>
              <th style={styles.th}>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((fb) => (
              <tr key={fb.id}>
                <td style={styles.td}>{fb.id}</td>
                <td style={styles.td}>{fb.rating}</td>
                <td style={styles.td}>{fb.wordRating || '—'}</td>
                <td style={styles.td}>{fb.topics.join(', ')}</td>
                <td style={styles.td}>{new Date(fb.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeedbackList;