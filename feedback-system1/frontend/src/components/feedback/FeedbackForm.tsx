import React, { useState } from 'react';
import api from '../../services/api';
import { feedbackQuestions, Question } from '../../config/questions';
import Toast from '../common/Toast';

interface FormData {
  [key: string]: any;
}

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  const handleChange = (questionId: string, value: any) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, optionValue: string, checked: boolean) => {
    const currentValues = formData[questionId] || [];
    if (checked) {
      handleChange(questionId, [...currentValues, optionValue]);
    } else {
      handleChange(questionId, currentValues.filter((v: string) => v !== optionValue));
    }
  };

  const validateForm = (): boolean => {
    for (const question of feedbackQuestions) {
      if (question.required) {
        const value = formData[question.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setToastMessage(`Please answer: ${question.label}`);
          setToastType('error');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await api.post('/api/feedback', {
        rating: parseInt(formData.rating),
        wordRating: formData.wordRating,
        topics: formData.topics || [],
        feedback: formData.feedback || ''
      });
      
      setToastMessage('Feedback submitted successfully! Thank you!');
      setToastType('success');
      setShowToast(true);
      setFormData({});
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Error submitting feedback');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = formData[question.id] || (question.type === 'checkbox' ? [] : '');

    switch (question.type) {
      case 'radio':
      case 'rating':
        return (
          <div style={styles.optionsGroup}>
            {question.options?.map(option => (
              <label key={option.value} style={styles.radioLabel}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div style={styles.optionsGroup}>
            {question.options?.map(option => (
              <label key={option.value} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={(e) => handleCheckboxChange(question.id, option.value, e.target.checked)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            style={styles.textarea}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📝 Share Your Feedback</h2>
      <p style={styles.subtitle}>Your opinion helps us improve our services</p>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}

      <form onSubmit={handleSubmit}>
        {feedbackQuestions.map(question => (
          <div key={question.id} style={styles.questionCard}>
            <label style={styles.questionLabel}>
              {question.label}
              {question.required && <span style={styles.required}>*</span>}
            </label>
            {renderQuestion(question)}
          </div>
        ))}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Submitting...' : '📤 Submit Feedback'}
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
  questionCard: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
  },
  questionLabel: {
    display: 'block',
    marginBottom: '0.75rem',
    fontWeight: 600,
    color: '#333',
    fontSize: '1rem',
  },
  required: {
    color: '#dc3545',
    marginLeft: '4px',
  },
  optionsGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
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
};

export default FeedbackForm;