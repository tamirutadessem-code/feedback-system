import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      ...(fullScreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        zIndex: 9999,
      }),
      ...(!fullScreen && { minHeight: '200px' }),
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ marginTop: '1rem', color: '#666' }}>{text}</p>
    </div>
  );
};

// Add keyframes style
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default Loader;