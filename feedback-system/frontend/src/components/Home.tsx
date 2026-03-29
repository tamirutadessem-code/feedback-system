import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // ✅ Correct named import

const Home: React.FC = () => {
  // Change this URL if your frontend is deployed or on a different port
  const formUrl = 'http://localhost:3000/form';

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      textAlign: 'center',
      marginTop: '2rem',
    },
    qr: {
      marginTop: '2rem',
      display: 'inline-block',
      padding: '1rem',
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  };

  return (
    <div style={styles.container}>
      <h1>Digital Transformation and Technological Innovation in Oromia</h1>
      <p>Scan this QR code with your phone to open the feedback form:</p>
      <div style={styles.qr}>
        <QRCodeCanvas value={formUrl} size={256} /> {/* ✅ Use QRCodeCanvas */}
      </div>
    </div>
  );
};

export default Home;