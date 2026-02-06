import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Enrollment {
  enrollmentId: string;
  courseName: string;
  instructor: string;
  schedule: string;
  date: string;
}

const MyTrainings = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/Enrollments/my-enrollments')
       .then(res => setEnrollments(res.data))
       .catch(err => console.error(err));
  }, []);

  // STILE DARK & GOLD (Condiviso)
  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', muted: '#a1a1aa', border: '#27272a' };
  
  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate('/corsi')} style={{ background: 'transparent', border: 'none', color: theme.muted, cursor: 'pointer', marginBottom: '20px' }}>
          ← Torna ai Corsi
        </button>

        <h1 style={{ color: theme.gold, textTransform: 'uppercase', fontSize: '2rem' }}>I Miei Allenamenti</h1>
        <p style={{ color: theme.muted, marginBottom: '40px' }}>Ecco i corsi a cui sei iscritto.</p>

        {enrollments.length === 0 ? (
          <div style={{ padding: '40px', background: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
            <p>Non sei iscritto a nessun corso.</p>
            <button onClick={() => navigate('/corsi')} style={{ marginTop: '10px', padding: '10px 20px', background: theme.gold, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>TROVA UN CORSO</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {enrollments.map(item => (
              <div key={item.enrollmentId} style={{ 
                  background: theme.card, 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: 'white' }}>{item.courseName}</h3>
                  <div style={{ color: theme.muted, fontSize: '0.9rem' }}>
                    Coach: <span style={{ color: theme.gold }}>{item.instructor}</span> • 🕒 {item.schedule}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                        ISCRITTO
                    </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrainings;