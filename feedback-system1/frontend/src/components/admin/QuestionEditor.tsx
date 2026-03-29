import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../common/Toast';
import Loader from '../common/Loader';

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
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const QuestionEditor: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'text' as Question['type'],
    text: '',
    options: [] as string[],
    required: false,
    order: 0,
    isActive: true
  });
  
  const [optionInput, setOptionInput] = useState('');

  useEffect(() => {
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
      let data = response.data.data || response.data;
      if (!Array.isArray(data)) {
        data = [];
      }
      setSectors(data);
      if (data.length > 0) {
        setSelectedSector(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching sectors:', err);
      showMessage('Failed to load sectors', 'error');
    }
  };

  const fetchQuestions = async () => {
    if (!selectedSector) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/questions/sector/${selectedSector}`);
      let data = response.data.data || response.data;
      if (!Array.isArray(data)) {
        data = [];
      }
      setQuestions(data);
      console.log('✅ Questions loaded:', data);
    } catch (err) {
      console.error('Error fetching questions:', err);
      showMessage('Failed to load questions', 'error');
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

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, optionInput.trim()]
      });
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      type: 'text',
      text: '',
      options: [],
      required: false,
      order: questions.length,
      isActive: true
    });
    setEditingId(null);
    setOptionInput('');
  };

  const handleSaveQuestion = async () => {
    if (!selectedSector) {
      showMessage('Please select a sector', 'error');
      return;
    }
    
    if (!formData.text.trim()) {
      showMessage('Please enter question text', 'error');
      return;
    }
    
    if ((formData.type === 'radio' || formData.type === 'checkbox') && formData.options.length === 0) {
      showMessage('Please add at least one option for radio/checkbox questions', 'error');
      return;
    }
    
    setSubmitting(true);
    
    const questionData = {
      sectorId: selectedSector,
      type: formData.type,
      text: formData.text,
      options: formData.options.length > 0 ? formData.options : null,
      required: formData.required,
      order: formData.order,
      isActive: formData.isActive
    };
    
    console.log('📤 Sending question data:', questionData);
    
    try {
      if (editingId) {
        await api.put(`/api/questions/${editingId}`, questionData);
        showMessage('Question updated successfully!', 'success');
      } else {
        await api.post('/api/questions', questionData);
        showMessage('Question created successfully!', 'success');
      }
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      console.error('❌ Error saving question:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to save question';
      showMessage(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      type: question.type,
      text: question.text,
      options: question.options || [],
      required: question.required,
      order: question.order,
      isActive: question.isActive
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await api.delete(`/api/questions/${id}`);
      showMessage('Question deleted successfully!', 'success');
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      showMessage('Failed to delete question', 'error');
    }
  };

  const handleToggleStatus = async (question: Question) => {
    try {
      await api.patch(`/api/questions/${question.id}/toggle`);
      showMessage(`Question ${question.isActive ? 'deactivated' : 'activated'} successfully!`, 'success');
      fetchQuestions();
    } catch (err) {
      console.error('Error toggling question status:', err);
      showMessage('Failed to update question status', 'error');
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      radio: '🔘 Radio',
      checkbox: '☑️ Checkbox',
      text: '📝 Short Text',
      textarea: '📄 Long Text',
      rating: '⭐ Rating'
    };
    return labels[type] || type;
  };

  const getQuestionTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      radio: '🔘',
      checkbox: '☑️',
      text: '📝',
      textarea: '📄',
      rating: '⭐'
    };
    return icons[type] || '❓';
  };

  if (loading && questions.length === 0) {
    return <Loader fullScreen text="Loading questions..." />;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📝 Question Editor</h2>
      <p style={styles.subtitle}>Manage questions for each sector</p>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}

      {/* Sector Selector */}
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
      </div>

      {/* Question Form */}
      <div style={styles.formCard}>
        <h3>{editingId ? '✏️ Edit Question' : '➕ Add New Question'}</h3>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Question Type:</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Question['type'] })}
            style={styles.select}
          >
            <option value="text">📝 Short Text</option>
            <option value="textarea">📄 Long Text</option>
            <option value="radio">🔘 Radio Button</option>
            <option value="checkbox">☑️ Checkbox</option>
            <option value="rating">⭐ Rating (1-5)</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Question Text:</label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            style={styles.textarea}
            rows={3}
            placeholder="Enter your question here..."
          />
        </div>

        {(formData.type === 'radio' || formData.type === 'checkbox') && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Options:</label>
            <div style={styles.optionsInput}>
              <input
                type="text"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                placeholder="Enter option and press Enter"
                style={styles.input}
              />
              <button onClick={handleAddOption} style={styles.addBtn}>Add Option</button>
            </div>
            <div style={styles.optionsList}>
              {formData.options.map((opt, idx) => (
                <span key={idx} style={styles.optionTag}>
                  {opt}
                  <button onClick={() => handleRemoveOption(idx)} style={styles.removeOption}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
            />
            Required question
          </label>
        </div>

        <div style={styles.formActions}>
          <button onClick={handleSaveQuestion} disabled={submitting} style={styles.saveBtn}>
            {submitting ? 'Saving...' : editingId ? 'Update Question' : 'Add Question'}
          </button>
          {editingId && (
            <button onClick={resetForm} style={styles.cancelBtn}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Questions Table */}
      <div style={styles.tableCard}>
        <h3>📋 Questions for {sectors.find(s => s.id === selectedSector)?.name || 'Selected Sector'}</h3>
        {questions.length === 0 ? (
          <p style={styles.emptyState}>No questions yet. Add your first question above.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Question</th>
                  <th style={styles.th}>Options</th>
                  <th style={styles.th}>Required</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => (
                  <tr key={q.id} style={{ opacity: q.isActive ? 1 : 0.5, backgroundColor: editingId === q.id ? '#fff3cd' : 'transparent' }}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>
                      <span style={styles.typeBadge}>
                        {getQuestionTypeIcon(q.type)} {getQuestionTypeLabel(q.type)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.questionTextCell}>{q.text}</div>
                    </td>
                    <td style={styles.td}>
                      {q.options && q.options.length > 0 ? (
                        <div style={styles.optionsList}>
                          {q.options.map((opt, i) => (
                            <span key={i} style={styles.optionTagSmall}>{opt}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={styles.noOptions}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={q.required ? styles.requiredBadge : styles.optionalBadge}>
                        {q.required ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={q.isActive ? styles.activeBadge : styles.inactiveBadge}>
                        {q.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button onClick={() => handleEdit(q)} style={styles.editBtn} title="Edit">✏️</button>
                        <button onClick={() => handleToggleStatus(q)} style={styles.toggleBtn} title={q.isActive ? 'Deactivate' : 'Activate'}>
                          {q.isActive ? '🔴' : '🟢'}
                        </button>
                        <button onClick={() => handleDelete(q.id)} style={styles.deleteBtn} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '1rem',
  },
  title: {
    marginBottom: '0.5rem',
    color: '#333',
  },
  subtitle: {
    marginBottom: '2rem',
    color: '#666',
  },
  sectorSelector: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  formGroup: {
    marginBottom: '1rem',
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
    borderRadius: '4px',
    fontSize: '1rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  optionsInput: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  optionsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  optionTag: {
    backgroundColor: '#e9ecef',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  optionTagSmall: {
    backgroundColor: '#e9ecef',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
  },
  removeOption: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#dc3545',
    padding: '0 0.25rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  saveBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelBtn: {
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
  },
  th: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 600,
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    verticalAlign: 'top',
  },
  typeBadge: {
    backgroundColor: '#e9ecef',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    display: 'inline-block',
  },
  questionTextCell: {
    maxWidth: '300px',
    wordBreak: 'break-word',
  },
  noOptions: {
    color: '#999',
    fontSize: '0.75rem',
  },
  requiredBadge: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    display: 'inline-block',
  },
  optionalBadge: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    display: 'inline-block',
  },
  activeBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    display: 'inline-block',
  },
  inactiveBadge: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '4px 8px',
    backgroundColor: '#ffc107',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  toggleBtn: {
    padding: '4px 8px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  deleteBtn: {
    padding: '4px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
};

export default QuestionEditor;