import React from 'react';
import { FieldOption } from '../config/feedbackConfig';

interface DynamicFormFieldProps {
  field: {
    id: string;
    type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'select';
    label: string;
    name: string;
    options?: FieldOption[];
    required?: boolean;
    placeholder?: string;
  };
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({ field, value, onChange, error }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, checked, value: inputValue } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      // Handle checkbox arrays
      const currentValues = Array.isArray(value) ? value : [];
      if (checked) {
        onChange(name, [...currentValues, inputValue]);
      } else {
        onChange(name, currentValues.filter((v: string) => v !== inputValue));
      }
    } else {
      onChange(name, inputValue);
    }
  };

  const renderField = () => {
    switch (field.type) {
      case 'radio':
        return (
          <div style={styles.radioGroup}>
            {field.options?.map((option) => (
              <label key={option.value} style={styles.radioLabel}>
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div style={styles.checkboxGroup}>
            {field.options?.map((option) => (
              <label key={option.value} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name={field.name}
                  value={option.value}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={handleChange}
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder}
            style={styles.input}
          />
        );

      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder}
            style={styles.textarea}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {field.label}
        {field.required && <span style={styles.required}>*</span>}
      </label>
      {renderField()}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  field: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
  },
  required: {
    color: 'red',
    marginLeft: '0.25rem',
  },
  radioGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  input: {
    width: '100%',
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
  select: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white',
  },
  error: {
    color: 'red',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
};

export default DynamicFormField;