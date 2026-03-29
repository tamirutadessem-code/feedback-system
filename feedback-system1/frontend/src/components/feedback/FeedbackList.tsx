import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Toast from '../common/Toast';
import Loader from '../common/Loader';

interface Feedback {
  id: number;
  rating: number;
  wordRating: string;
  topics: string[];
  createdAt: string;
  sectorId?: number;
  answers?: any;
  comments?: string;
}

const FeedbackList: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ rating: 0, wordRating: '', topics: [] as string[] });
  const [stats, setStats] = useState({ total: 0, avgRating: 0, topTopic: '' });
  const [filter, setFilter] = useState({ rating: '', dateFrom: '', dateTo: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const wordRatings = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];
  const topics = [
    'Technology',
    'Science',
    'Art',
    'Sports',
    'Education',
    'Business',
    'Health'
  ];

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/feedback/stats');
      const data = response.data;
      setStats({
        total: data.total || feedbacks.length,
        avgRating: data.averageRating || 0,
        topTopic: data.topTopic || 'N/A'
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Use calculated stats if API fails
      if (feedbacks.length > 0) {
        const avg = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
        setStats({
          total: feedbacks.length,
          avgRating: avg,
          topTopic: 'N/A'
        });
      }
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get('/api/feedback');
      let data = response.data;
      if (data && !Array.isArray(data)) {
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.success && Array.isArray(data.data)) {
          data = data.data;
        } else {
          data = [];
        }
      }
      setFeedbacks(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEdit = (feedback: Feedback) => {
    setEditingId(feedback.id);
    setEditData({
      rating: feedback.rating,
      wordRating: feedback.wordRating,
      topics: [...feedback.topics],
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/api/feedback/${id}`, editData);
      showMessage('Feedback updated successfully!', 'success');
      setEditingId(null);
      fetchFeedbacks();
      fetchStats();
    } catch (err) {
      showMessage('Failed to update feedback', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(`/api/feedback/${id}`);
      showMessage('Feedback deleted successfully!', 'success');
      fetchFeedbacks();
      fetchStats();
    } catch (err) {
      showMessage('Failed to delete feedback', 'error');
    }
  };

  const handleTopicToggle = (topic: string) => {
    setEditData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return '#dc3545';
    if (rating === 3) return '#ffc107';
    return '#28a745';
  };

  const getWordRatingColor = (wordRating: string) => {
    const colors: { [key: string]: string } = {
      'Very Poor': '#dc3545',
      'Poor': '#fd7e14',
      'Average': '#ffc107',
      'Good': '#28a745',
      'Excellent': '#20c997'
    };
    return colors[wordRating] || '#6c757d';
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filter.rating && fb.rating.toString() !== filter.rating) return false;
    if (filter.dateFrom && new Date(fb.createdAt) < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && new Date(fb.createdAt) > new Date(filter.dateTo)) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Rating', 'Word Rating', 'Topics', 'Date'];
    const rows = feedbacks.map(fb => [
      fb.id,
      fb.rating,
      fb.wordRating,
      fb.topics.join('; '),
      new Date(fb.createdAt).toLocaleString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showMessage('Export completed!', 'success');
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 All Feedback Submissions</h2>
      <p style={styles.subtitle}>Manage and moderate user feedback</p>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Feedbacks</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.avgRating.toFixed(1)} ⭐</div>
          <div style={styles.statLabel}>Average Rating</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.topTopic}</div>
          <div style={styles.statLabel}>Most Popular Topic</div>
        </div>
        <button onClick={exportToCSV} style={styles.exportBtn}>📥 Export CSV</button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={filter.rating}
          onChange={(e) => setFilter({ ...filter, rating: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="">All Ratings</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
        <input
          type="date"
          value={filter.dateFrom}
          onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
          style={styles.filterInput}
          placeholder="From Date"
        />
        <input
          type="date"
          value={filter.dateTo}
          onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
          style={styles.filterInput}
          placeholder="To Date"
        />
        <button onClick={() => setFilter({ rating: '', dateFrom: '', dateTo: '' })} style={styles.clearBtn}>
          Clear Filters
        </button>
      </div>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}

      {filteredFeedbacks.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No feedback found matching your filters.</p>
        </div>
      ) : (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Rating</th>
                  <th style={styles.th}>Word Rating</th>
                  <th style={styles.th}>Topics</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFeedbacks.map((fb) => (
                  <tr key={fb.id}>
                    <td style={styles.td}>{fb.id}</td>
                    <td style={styles.td}>
                      {editingId === fb.id ? (
                        <select
                          value={editData.rating}
                          onChange={(e) => setEditData({ ...editData, rating: parseInt(e.target.value) })}
                          style={styles.select}
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      ) : (
                        <span style={{ ...styles.rating, color: getRatingColor(fb.rating) }}>
                          {fb.rating} ⭐
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === fb.id ? (
                        <select
                          value={editData.wordRating}
                          onChange={(e) => setEditData({ ...editData, wordRating: e.target.value })}
                          style={styles.select}
                        >
                          {wordRatings.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      ) : (
                        <span style={{ color: getWordRatingColor(fb.wordRating) }}>
                          {fb.wordRating}
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === fb.id ? (
                        <div style={styles.topicCheckboxes}>
                          {topics.map(topic => (
                            <label key={topic} style={styles.topicLabel}>
                              <input
                                type="checkbox"
                                checked={editData.topics.includes(topic)}
                                onChange={() => handleTopicToggle(topic)}
                              />
                              <span style={styles.topicText}>{topic}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div style={styles.topics}>
                          {fb.topics && fb.topics.map((t, i) => (
                            <span key={i} style={styles.topicTag}>{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>{new Date(fb.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      {editingId === fb.id ? (
                        <>
                          <button onClick={() => handleUpdate(fb.id)} style={styles.saveBtn}>💾 Save</button>
                          <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>❌ Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(fb)} style={styles.editBtn}>✏️ Edit</button>
                          <button onClick={() => handleDelete(fb.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={styles.pageBtn}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1400px',
    margin: '2rem auto',
    padding: '1rem',
  },
  title: {
    marginBottom: '0.5rem',
    color: '#333',
    fontSize: '1.75rem',
  },
  subtitle: {
    marginBottom: '1.5rem',
    color: '#666',
  },
  statsContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
    minWidth: '120px',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  exportBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  filterInput: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  clearBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '8px',
  },
  th: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    verticalAlign: 'top',
  },
  rating: {
    fontWeight: 600,
  },
  topics: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  topicTag: {
    backgroundColor: '#e9ecef',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
  },
  select: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  topicCheckboxes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  topicLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
  },
  topicText: {
    fontSize: '0.7rem',
  },
  editBtn: {
    backgroundColor: '#ffc107',
    color: '#333',
    border: 'none',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: 'red',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  pageBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: '#666',
  },
};

export default FeedbackList;