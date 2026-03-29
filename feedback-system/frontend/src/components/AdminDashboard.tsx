import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

// Define the structure of the stats from the backend
interface Stats {
  ratingCounts: Record<number, number>;
  wordRatingCounts: Record<string, number>;
  topicCounts: Record<string, number>;
}

// Types for the data used in charts
interface RatingData {
  rating: number;
  count: number;
}

interface WordRatingData {
  word: string;
  count: number;
}

interface TopicData {
  topic: string;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get<Stats>('http://localhost:5000/api/feedback/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (loading) return <p>Loading stats...</p>;
  if (!stats) return <p>No data available</p>;

  // Prepare data with explicit types
  const ratingData: RatingData[] = Object.entries(stats.ratingCounts).map(([rating, count]) => ({
    rating: Number(rating),
    count,
  }));

  const wordRatingData: WordRatingData[] = Object.entries(stats.wordRatingCounts).map(([word, count]) => ({
    word,
    count,
  }));

  const topicData: TopicData[] = Object.entries(stats.topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Rating Distribution Bar Chart */}
        <div>
          <h3>Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Word Rating Pie Chart */}
        <div>
          <h3>Word Rating Counts</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={wordRatingData}
                dataKey="count"
                nameKey="word"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {wordRatingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Popularity Bar Chart (horizontal) */}
        <div style={{ gridColumn: 'span 2' }}>
          <h3>Topic Popularity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="topic" width={200} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;