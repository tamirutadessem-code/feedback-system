import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../common/Toast';

interface Sector {
  id: number;
  name: string;
  description: string;
}

interface Question {
  id: number;
  sectorId: number;
  type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'rating';
  text: string;
  options: string[] | null;
  required: boolean;
  order: number;
}

const DynamicFeedbackForm: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const [rating, setRating] = useState<number | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    console.log('🌐 Current hostname:', window.location.hostname);
    console.log('🔧 API URL:', api.defaults.baseURL);
    fetchSectors();
  }, []);

  useEffect(() => {
    if (selectedSector) {
      fetchQuestions();
    }
  }, [selectedSector]);

  const fetchSectors = async () => {
    try {
      const response = await api.get('/api/sectors');
      console.log('✅ Sectors loaded:', response.data);
      setSectors(response.data);
      if (response.data.length > 0) {
        setSelectedSector(response.data[0].id);
      }
      setError(null);
    } catch (err: any) {
      console.error('❌ Failed to load sectors:', err);
      setError('Failed to load sectors. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!selectedSector) return;
    try {
      const response = await api.get(`/api/sectors/${selectedSector}/questions`);
      console.log('✅ Questions loaded:', response.data);
      setQuestions(response.data);
      const initialAnswers: Record<number, any> = {};
      response.data.forEach((q: Question) => {
        if (q.type === 'checkbox') {
          initialAnswers[q.id] = [];
        } else {
          initialAnswers[q.id] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('❌ Failed to load questions:', err);
      setError('Failed to load questions. Please try again.');
    }
  };

  const showMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleChange = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: number, option: string, checked: boolean) => {
    const current = answers[questionId] || [];
    if (checked) {
      handleChange(questionId, [...current, option]);
    } else {
      handleChange(questionId, current.filter((v: string) => v !== option));
    }
  };

  const handleTopicChange = (topic: string, checked: boolean) => {
    if (checked) {
      setTopics([...topics, topic]);
    } else {
      setTopics(topics.filter(t => t !== topic));
    }
  };

  const validateForm = (): boolean => {
    if (!rating) {
      showMessage('Please select a rating (1-5)', 'error');
      return false;
    }
    
    if (topics.length === 0) {
      showMessage('Please select at least one topic', 'error');
      return false;
    }
    
    for (const question of questions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          showMessage(`Please answer: ${question.text}`, 'error');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    
    const feedbackData = {
      rating: rating,
      topics: topics,
      sectorId: selectedSector,
      answers: answers,
      comments: ''
    };
    
    console.log('📤 Sending feedback data:', feedbackData);

    try {
      await api.post('/api/feedback', feedbackData);
      showMessage('Feedback submitted successfully! Thank you!', 'success');
      
      setRating(null);
      setTopics([]);
      const resetAnswers: Record<number, any> = {};
      questions.forEach(q => {
        if (q.type === 'checkbox') {
          resetAnswers[q.id] = [];
        } else {
          resetAnswers[q.id] = '';
        }
      });
      setAnswers(resetAnswers);
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error submitting feedback';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingSelector = () => {
    const ratingOptions = [
      { value: 1, label: '⭐ Very Poor' },
      { value: 2, label: '⭐⭐ Poor' },
      { value: 3, label: '⭐⭐⭐ Average' },
      { value: 4, label: '⭐⭐⭐⭐ Good' },
      { value: 5, label: '⭐⭐⭐⭐⭐ Excellent' }
    ];
    
    return (
      <div style={styles.questionCard}>
        <div style={styles.questionHeader}>
          <span style={styles.questionNumber}>Rating</span>
          <span style={styles.questionText}>How would you rate your overall experience?</span>
          <span style={styles.required}>*</span>
        </div>
        <div style={styles.optionsGroupHorizontal}>
          {ratingOptions.map(opt => (
            <label key={opt.value} style={styles.horizontalLabel}>
              <input
                type="radio"
                name="rating"
                value={opt.value}
                checked={rating === opt.value}
                onChange={() => setRating(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderTopicsSelector = () => {
    const topicOptions = ['Technology', 'Science', 'Art', 'Sports', 'Education', 'Business', 'Health'];
    
    return (
      <div style={styles.questionCard}>
        <div style={styles.questionHeader}>
          <span style={styles.questionNumber}>Topics</span>
          <span style={styles.questionText}>Which topics are you interested in?</span>
          <span style={styles.required}>*</span>
        </div>
        <div style={styles.optionsGroupHorizontal}>
          {topicOptions.map(topic => (
            <label key={topic} style={styles.horizontalLabel}>
              <input
                type="checkbox"
                checked={topics.includes(topic)}
                onChange={(e) => handleTopicChange(topic, e.target.checked)}
              />
              <span>{topic}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderRating = (question: Question, value: any) => {
    return (
      <div style={styles.optionsGroupHorizontal}>
        {[1, 2, 3, 4, 5].map(num => (
          <label key={num} style={styles.horizontalLabel}>
            <input
              type="radio"
              name={`q_${question.id}`}
              value={num}
              checked={value === num}
              onChange={(e) => handleChange(question.id, parseInt(e.target.value))}
            />
            <span>{num} ⭐</span>
          </label>
        ))}
      </div>
    );
  };

  const renderRadio = (question: Question, value: any) => {
    return (
      <div style={styles.optionsGroupHorizontal}>
        {question.options?.map(option => (
          <label key={option} style={styles.horizontalLabel}>
            <input
              type="radio"
              name={`q_${question.id}`}
              value={option}
              checked={value === option}
              onChange={(e) => handleChange(question.id, e.target.value)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderCheckbox = (question: Question, value: any) => {
    return (
      <div style={styles.optionsGroupHorizontal}>
        {question.options?.map(option => (
          <label key={option} style={styles.horizontalLabel}>
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderText = (question: Question, value: any) => {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleChange(question.id, e.target.value)}
        style={styles.input}
        placeholder="Your answer..."
      />
    );
  };

  const renderTextarea = (question: Question, value: any) => {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => handleChange(question.id, e.target.value)}
        style={styles.textarea}
        rows={3}
        placeholder="Your answer..."
      />
    );
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id] || (question.type === 'checkbox' ? [] : '');

    switch (question.type) {
      case 'rating': return renderRating(question, value);
      case 'radio': return renderRadio(question, value);
      case 'checkbox': return renderCheckbox(question, value);
      case 'text': return renderText(question, value);
      case 'textarea': return renderTextarea(question, value);
      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={() => window.location.reload()} style={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📝 Share Your Feedback</h2>
      <p style={styles.subtitle}>Your opinion helps us improve our services</p>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}

      <div style={styles.sectorSelector}>
        <label style={styles.label}>Select Sector:</label>
        <select
          value={selectedSector || ''}
          onChange={(e) => setSelectedSector(parseInt(e.target.value))}
          style={styles.select}
        >
          {sectors.map(sector => (
            <option key={sector.id} value={sector.id}>{sector.name}</option>
          ))}
        </select>
        {sectors.find(s => s.id === selectedSector)?.description && (
          <p style={styles.sectorDescription}>
            {sectors.find(s => s.id === selectedSector)?.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {renderRatingSelector()}
        {renderTopicsSelector()}
        
        {questions.length === 0 ? (
          <div style={styles.noQuestions}>
            <p>No additional questions available for this sector.</p>
          </div>
        ) : (
          <>
            <h3 style={styles.subsectionTitle}>Additional Questions</h3>
            {questions.map((question, index) => (
              <div key={question.id} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionNumber}>Q{index + 1}</span>
                  <span style={styles.questionText}>{question.text}</span>
                  {question.required && <span style={styles.required}>*</span>}
                </div>
                {renderQuestion(question)}
              </div>
            ))}
          </>
        )}

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? 'Submitting...' : '📤 Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem',
  },
  subsectionTitle: {
    fontSize: '1.2rem',
    margin: '1.5rem 0 1rem',
    color: '#555',
    borderBottom: '2px solid #007bff',
    paddingBottom: '0.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: 'red',
  },
  retryBtn: {
    display: 'block',
    margin: '1rem auto',
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  sectorSelector: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
  },
  sectorDescription: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#555',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  questionCard: {
    marginBottom: '1.5rem',
    padding: '1.25rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
  },
  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  questionNumber: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  questionText: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#333',
    flex: 1,
  },
  required: {
    color: '#dc3545',
    fontSize: '1rem',
  },
  optionsGroupHorizontal: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  horizontalLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    marginTop: '0.5rem',
    resize: 'vertical',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
    fontWeight: 600,
  },
  noQuestions: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
};

export default DynamicFeedbackForm;