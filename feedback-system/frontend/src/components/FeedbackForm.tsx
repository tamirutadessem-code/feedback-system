import React, { useState, useRef } from 'react';
import axios from 'axios';

const FeedbackForm: React.FC = () => {
  const [rating, setRating] = useState<string>('');
  const [wordRating, setWordRating] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  // Ref to store the timeout ID so we can clear it if needed
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: set a message and clear it after `duration` ms
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

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setTopics([...topics, value]);
    } else {
      setTopics(topics.filter((t) => t !== value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !wordRating || topics.length === 0) {
      setAutoClearMessage('Please complete all fields (numeric rating, word rating, and at least one topic).', 3000);
      return;
    }

    console.log('🚀 Submitting:', { rating, wordRating, topics });

    try {
      await axios.post('http://localhost:5000/api/feedback', {
        rating,
        wordRating,
        topics,
      });
      setAutoClearMessage('Feedback submitted successfully!', 2000);
      setRating('');
      setWordRating('');
      setTopics([]);
    } catch (err) {
      console.error(err);
      setAutoClearMessage('Error submitting feedback.', 3000);
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    form: { display: 'flex', flexDirection: 'column' },
    field: { marginBottom: '1.5rem' },
    radioGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '0.5rem',
      flexWrap: 'wrap',
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    button: {
      padding: '0.75rem',
      backgroundColor: '#4a90e2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
    },
    message: {
      marginTop: '1rem',
      textAlign: 'center',
      color: '#4a90e2',
    },
  };

  return (
    <div style={styles.container}>
      <h2>Yaada Keessan Nuuf Qoodaa</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Numeric rating */}
        <div style={styles.field}>
          <label>Kalaqawwan teeknoolojii har'a asitti argitan keessaa inni caalaatti isin ajaa'ibe ykn yaada haaraa isiniif kenne isa kami?</label>
          <div style={styles.radioGroup}>
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  checked={rating === num.toString()}
                  onChange={(e) => setRating(e.target.value)}
                />
                {num}
              </label>
            ))}
          </div>
        </div>

        {/* Word rating */}
        <div style={styles.field}>
          <label>Teeknolojiin asitti dhiyaatan kunniin, rakkoolee hawaasaa hiikuu fi tajaajila ammayyeessuu keessatti gahee akkamii ni qabaatu jettee amanta?</label>
          <div style={styles.radioGroup}>
            {['Giddu-galeessa ', 'Gaarii', 'Quubsaa', 'Baayee Gaarii', 'Ol-aanaa'].map((word) => (
              <label key={word} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="wordRating"
                  value={word}
                  checked={wordRating === word}
                  onChange={(e) => setWordRating(e.target.value)}
                />
                {word.charAt(0).toUpperCase() + word.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div style={styles.field}>
          <label>Teeknoolojiin har'a argitan kunniin, jireenya hawaasa keenyaa fi adeemsa hojii keessatti dameewwan kam keessatti jijjiirama guddaa fiduu danda'u jettee amanta?</label>
          <div style={styles.checkboxGroup}>
            {[' Saffisa tajaajila mootummaa fi hojii daldalaa fooyyessuu', 'Hojii haaraa uumuu fi dinagdee naannoo guddisuu', 'Malaammaltummaa hirisuu fi iftoomina dabaluu', 'Jireenya qotee bulaa ammayyeessuu fi omishaa dabaluu'].map((topic) => (
              <label key={topic} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  value={topic}
                  checked={topics.includes(topic)}
                  onChange={handleTopicChange}
                />
                {topic}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={styles.button}>Submit</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

export default FeedbackForm;