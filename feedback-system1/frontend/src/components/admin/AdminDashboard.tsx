import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Loader from '../common/Loader';

interface Feedback {
  id: number;
  rating: number;
  wordRating: string;
  topics: string[];
  answers: Record<string, any>;
  createdAt: string;
}

interface FeedbackStats {
  total: number;
  averageRating: number;
  ratingCounts: Record<number, number>;
  wordRatingCounts: Record<string, number>;
  topicCounts: Record<string, number>;
  questionStats: Record<string, any>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#4ecdc4'];

const AdminDashboard: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'answers'>('overview');
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchQuestions();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all feedbacks
      const feedbackResponse = await api.get('/api/feedback');
      let feedbackData = feedbackResponse.data.data || feedbackResponse.data;
      if (Array.isArray(feedbackData)) {
        setFeedbacks(feedbackData);
      }

      // Fetch stats
      const statsResponse = await api.get('/api/feedback/stats');
      let statsData = statsResponse.data.data || statsResponse.data;
      
      // Calculate question statistics from answers
      const questionStats: Record<string, any> = {};
      
      feedbackData.forEach((fb: Feedback) => {
        if (fb.answers && typeof fb.answers === 'object') {
          Object.entries(fb.answers).forEach(([qId, answer]) => {
            if (!questionStats[qId]) {
              questionStats[qId] = {
                answers: {},
                total: 0,
                answerList: []
              };
            }
            const answerStr = Array.isArray(answer) ? answer.join(', ') : String(answer);
            questionStats[qId].answers[answerStr] = (questionStats[qId].answers[answerStr] || 0) + 1;
            questionStats[qId].total++;
            questionStats[qId].answerList.push(answerStr);
          });
        }
      });
      
      setStats({
        ...statsData,
        questionStats
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/api/questions');
      let data = response.data.data || response.data;
      if (Array.isArray(data)) {
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const getRatingLabel = (rating: number): string => {
    const labels: Record<number, string> = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return labels[rating] || 'Unknown';
  };

  const getRatingColor = (rating: number): string => {
    if (rating <= 2) return '#dc3545';
    if (rating === 3) return '#ffc107';
    return '#28a745';
  };

  const prepareTrendData = () => {
    if (!feedbacks.length) return [];
    
    const trends: Record<string, { count: number; totalRating: number }> = {};
    const now = new Date();
    const daysToShow = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    
    feedbacks.forEach(fb => {
      const date = new Date(fb.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!trends[dateKey]) {
        trends[dateKey] = { count: 0, totalRating: 0 };
      }
      trends[dateKey].count++;
      trends[dateKey].totalRating += fb.rating;
    });
    
    const result = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const data = trends[dateKey] || { count: 0, totalRating: 0 };
      
      result.push({
        date: dateKey,
        count: data.count,
        avgRating: data.count > 0 ? data.totalRating / data.count : 0
      });
    }
    
    return result;
  };

  const getQuestionText = (questionId: string): string => {
    const question = questions.find(q => q.id === parseInt(questionId));
    return question ? question.text : `Question ${questionId}`;
  };

  if (loading) return <Loader fullScreen text="Loading dashboard..." />;
  if (error) return <div style={styles.error}>{error}</div>;

  const ratingData = stats?.ratingCounts ? Object.entries(stats.ratingCounts)
    .map(([rating, count]) => ({
      rating: Number(rating),
      ratingLabel: getRatingLabel(Number(rating)),
      count,
    }))
    .sort((a, b) => a.rating - b.rating) : [];

  const wordRatingData = stats?.wordRatingCounts ? Object.entries(stats.wordRatingCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count) : [];

  const topicData = stats?.topicCounts ? Object.entries(stats.topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) : [];

  const trendData = prepareTrendData();
  const totalFeedbacks = feedbacks.length;
  const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedbacks || 0;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📈 Admin Dashboard</h1>
      <p style={styles.subtitle}>Real-time feedback analytics and insights</p>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setSelectedTab('overview')}
          style={{...styles.tab, ...(selectedTab === 'overview' ? styles.activeTab : {})}}
        >
          📊 Overview
        </button>
        <button 
          onClick={() => setSelectedTab('answers')}
          style={{...styles.tab, ...(selectedTab === 'answers' ? styles.activeTab : {})}}
        >
          📝 Detailed Answers
        </button>
      </div>

      {selectedTab === 'overview' ? (
        <>
          {/* Summary Cards */}
          <div style={styles.summaryGrid}>
            <div style={styles.card}>
              <div style={styles.cardIcon}>📊</div>
              <div style={styles.cardTitle}>Total Feedbacks</div>
              <div style={styles.cardValue}>{totalFeedbacks}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardIcon}>⭐</div>
              <div style={styles.cardTitle}>Average Rating</div>
              <div style={styles.cardValue}>{avgRating.toFixed(1)} / 5</div>
              <div style={styles.cardSubValue}>
                {avgRating >= 4 ? 'Excellent' : avgRating >= 3 ? 'Good' : avgRating >= 2 ? 'Average' : 'Poor'}
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardIcon}>🎯</div>
              <div style={styles.cardTitle}>Unique Topics</div>
              <div style={styles.cardValue}>{Object.keys(stats?.topicCounts || {}).length}</div>
            </div>
          </div>

          {/* Trend Chart */}
          {trendData.length > 0 && (
            <div style={styles.fullWidthChart}>
              <div style={styles.chartHeader}>
                <h3>Feedback Trends</h3>
                <div style={styles.timeRangeSelector}>
                  <button onClick={() => setTimeRange('week')} style={{...styles.rangeBtn, ...(timeRange === 'week' ? styles.activeRange : {})}}>Week</button>
                  <button onClick={() => setTimeRange('month')} style={{...styles.rangeBtn, ...(timeRange === 'month' ? styles.activeRange : {})}}>Month</button>
                  <button onClick={() => setTimeRange('all')} style={{...styles.rangeBtn, ...(timeRange === 'all' ? styles.activeRange : {})}}>All</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="count" fill="#8884d8" stroke="#8884d8" name="Feedback Count" />
                  <Area yAxisId="right" type="monotone" dataKey="avgRating" fill="#82ca9d" stroke="#82ca9d" name="Average Rating" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={styles.chartsGrid}>
            {/* Rating Distribution */}
            <div style={styles.chartCard}>
              <h3>Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ratingLabel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getRatingColor(entry.rating)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Word Rating Distribution */}
            <div style={styles.chartCard}>
              <h3>Word Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={wordRatingData} dataKey="count" nameKey="word" cx="50%" cy="50%" outerRadius={100} label={({ word, percent }) => `${word}: ${(percent * 100).toFixed(0)}%`}>
                    {wordRatingData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Topics */}
            <div style={styles.fullWidthChart}>
              <h3>Top Topics</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topicData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="topic" width={200} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Detailed Answers Table */}
          <div style={styles.tableContainer}>
            <h3>📝 All Feedback Answers</h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Rating</th>
                    <th style={styles.th}>Word Rating</th>
                    <th style={styles.th}>Topics</th>
                    {questions.map(q => (
                      <th key={q.id} style={styles.th}>{q.text.substring(0, 30)}...</th>
                    ))}
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((fb) => (
                    <tr key={fb.id}>
                      <td style={styles.td}>{fb.id}</td>
                      <td style={styles.td}>
                        <span style={{color: getRatingColor(fb.rating)}}>
                          {fb.rating} ⭐
                        </span>
                      </td>
                      <td style={styles.td}>{fb.wordRating}</td>
                      <td style={styles.td}>
                        <div style={styles.topicsContainer}>
                          {fb.topics?.map((t, i) => (
                            <span key={i} style={styles.topicTag}>{t}</span>
                          ))}
                        </div>
                      </td>
                      {questions.map((q) => (
                        <td key={q.id} style={styles.td}>
                          {fb.answers && fb.answers[q.id] ? (
                            Array.isArray(fb.answers[q.id]) 
                              ? fb.answers[q.id].join(', ')
                              : fb.answers[q.id]
                          ) : '-'}
                        </td>
                      ))}
                      <td style={styles.td}>{new Date(fb.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question Statistics */}
          <div style={styles.tableContainer}>
            <h3>📊 Question Statistics</h3>
            {stats?.questionStats && Object.entries(stats.questionStats).map(([qId, qStats]: [string, any]) => (
              <div key={qId} style={styles.questionStatsCard}>
                <h4>{getQuestionText(qId)}</h4>
                <p>Total Responses: {qStats.total}</p>
                <div style={styles.answerDistribution}>
                  {Object.entries(qStats.answers).map(([answer, count]: [string, any]) => (
                    <div key={answer} style={styles.answerBar}>
                      <span style={styles.answerLabel}>{answer || '(Empty)'}</span>
                      <div style={styles.barContainer}>
                        <div style={{...styles.barFill, width: `${(count / qStats.total) * 100}%`, backgroundColor: '#4caf50'}} />
                      </div>
                      <span style={styles.answerCount}>{count} ({((count / qStats.total) * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
  subtitle: {
    color: '#666',
    marginBottom: '2rem',
  },
  tabContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #e0e0e0',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#666',
    transition: 'all 0.3s',
  },
  activeTab: {
    color: '#007bff',
    borderBottom: '2px solid #007bff',
    marginBottom: '-2px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  cardTitle: { fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' },
  cardValue: { fontSize: '1.75rem', fontWeight: 'bold', color: '#333' },
  cardSubValue: { fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' },
  chartCard: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  fullWidthChart: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' },
  timeRangeSelector: { display: 'flex', gap: '0.5rem' },
  rangeBtn: { padding: '0.25rem 0.75rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem' },
  activeRange: { backgroundColor: '#007bff', color: 'white', borderColor: '#007bff' },
  tableContainer: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#007bff', color: 'white', padding: '12px', textAlign: 'left', position: 'sticky', top: 0 },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
  topicsContainer: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  topicTag: { backgroundColor: '#e9ecef', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  questionStatsCard: { marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' },
  answerDistribution: { marginTop: '0.5rem' },
  answerBar: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' },
  answerLabel: { width: '150px', fontSize: '0.875rem' },
  barContainer: { flex: 1, height: '24px', backgroundColor: '#e9ecef', borderRadius: '12px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '12px', transition: 'width 0.5s ease' },
  answerCount: { width: '80px', fontSize: '0.875rem', color: '#666' },
  error: { textAlign: 'center', padding: '2rem', color: 'red' },
};

export default AdminDashboard;