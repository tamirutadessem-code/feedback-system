import React, { useState, useRef } from 'react';
import axios from 'axios';
import { feedbackConfig } from '../config/feedbackConfig';
import DynamicFormField from './DynamicFormField';

const DynamicFeedbackForm: React.FC = () => {
  // Dynamic state based on configuration
  const [formData, setFormData] = useState<Record<string, any>>({
    rating: '',
    wordRating: '',
    topics: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>('');
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setAutoClearMessage = (msg: string, duration: number = 2000) => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMessage(msg);
    if (msg) {
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
        messageTimeoutRef.current = null;
      }, duration);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fields = feedbackConfig.fields;

    // Validate numeric rating
    if (fields.numericRating.required && !formData.rating) {
      newErrors.rating = 'Please select a rating';
    }

    // Validate word rating
    if (fields.wordRating.required && !formData.wordRating) {
      newErrors.wordRating = 'Please select a word rating';
    }

    // Validate topics (at least one selected)
    if (fields.topics.required && (!formData.topics || formData.topics.length === 0)) {
      newErrors.topics = 'Please select at least one topic';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAutoClearMessage('Please complete all required fields.', 3000);
      return;
    }

    console.log('🚀 Submitting:', formData);

    try {
      await axios.post(feedbackConfig.apiUrl, {
        rating: formData.rating,
        wordRating: formData.wordRating,
        topics: formData.topics,
      });
      
      setAutoClearMessage(feedbackConfig.successMessage, 2000);
      // Reset form
      setFormData({ rating: '', wordRating: '', topics: [] });
    } catch (err) {
      console.error(err);
      setAutoClearMessage(feedbackConfig.errorMessage, 3000);
    }
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    form: { display: 'flex', flexDirection: 'column' as const },
    button: {
      padding: '0.75rem',
      backgroundColor: '#4a90e2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
      marginTop: '1rem',
    },
    message: {
      marginTop: '1rem',
      textAlign: 'center' as const,
      color: '#4a90e2',
    },
  };

  return (
    <div style={styles.container}>
      <h2>Yaada Keessan Nuuf Qoodaa</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Dynamic fields from configuration */}
        <DynamicFormField
          field={feedbackConfig.fields.numericRating}
          value={formData.rating}
          onChange={handleFieldChange}
          error={errors.rating}
        />

        <DynamicFormField
          field={feedbackConfig.fields.wordRating}
          value={formData.wordRating}
          onChange={handleFieldChange}
          error={errors.wordRating}
        />

        <DynamicFormField
          field={feedbackConfig.fields.topics}
          value={formData.topics}
          onChange={handleFieldChange}
          error={errors.topics}
        />

        <button type="submit" style={styles.button}>Submit Feedback</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

export default DynamicFeedbackForm;