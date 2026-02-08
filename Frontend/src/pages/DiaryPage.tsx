import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiaryPage = () => {
  const navigate = useNavigate();
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  
  // Form stati
  const [workoutForm, setWorkoutForm] = useState({ exerciseName: '', sets: 0, reps: 0, weightLifted: 0 });
  const [measureForm, setMeasureForm] = useState({ weight: 0, notes: '' });

  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', border: '#27272a', input: '#09090b' };

  const fetchData = async () => {
    try {
      // Usiamo "me" o recuperiamo l'ID dal token per vedere i propri dati
      const resW = await api.get(`/Diary/workout/me`); // Assicurati che il backend gestisca "me" o l'ID corretto
      const resM = await api.get(`/Diary/measurement/me`);
      setWorkoutLogs(resW.data);
      setMeasurements(resM.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/Diary/workout', workoutForm);
    alert("Allenamento segnato!");
    fetchData();
  };

  const handleMeasureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/Diary/measurement', measureForm);
    alert("Peso aggiornato!");
    fetchData();
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '40px 20px' }}>
      <button onClick={() => navigate('/corsi')} style={{ color: theme.gold, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px' }}>← TORNA ALLA DASHBOARD</button>
      
      <h1 style={{ marginBottom: '40px' }}>📓 Il Mio Diario Personale</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* COLONNA ALLENAMENTO */}
        <div style={{ background: theme.card, padding: '25px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
          <h2 style={{ color: theme.gold }}>Segna Esercizio</h2>
          <form onSubmit={handleWorkoutSubmit}>
            <input style={inputStyle(theme)} placeholder="Nome Esercizio" onChange={e => setWorkoutForm({...workoutForm, exerciseName: e.target.value})} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" style={inputStyle(theme)} placeholder="Serie" onChange={e => setWorkoutForm({...workoutForm, sets: parseInt(e.target.value)})} />
              <input type="number" style={inputStyle(theme)} placeholder="Rep" onChange={e => setWorkoutForm({...workoutForm, reps: parseInt(e.target.value)})} />
              <input type="number" style={inputStyle(theme)} placeholder="Kg" onChange={e => setWorkoutForm({...workoutForm, weightLifted: parseFloat(e.target.value)})} />
            </div>
            <button type="submit" style={btnStyle(theme)}>SALVA ALLENAMENTO</button>
          </form>

          <div style={{ marginTop: '30px' }}>
            {workoutLogs.map(log => (
              <div key={log.id} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}`, fontSize: '0.9rem' }}>
                <b style={{color: theme.gold}}>{log.exerciseName}</b>: {log.sets}x{log.reps} - {log.weightLifted}kg 
                <span style={{ float: 'right', color: '#666' }}>{new Date(log.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNA MISURE */}
        <div style={{ background: theme.card, padding: '25px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
          <h2 style={{ color: theme.gold }}>Aggiorna Peso</h2>
          <form onSubmit={handleMeasureSubmit}>
            <input type="number" step="0.1" style={inputStyle(theme)} placeholder="Peso attuale (kg)" onChange={e => setMeasureForm({...measureForm, weight: parseFloat(e.target.value)})} />
            <textarea style={inputStyle(theme)} placeholder="Note (sensazioni, stress, sonno...)" onChange={e => setMeasureForm({...measureForm, notes: e.target.value})} />
            <button type="submit" style={btnStyle(theme)}>SALVA PESATA</button>
          </form>

          <div style={{ marginTop: '30px' }}>
            {measurements.map(m => (
              <div key={m.id} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}`, fontSize: '0.9rem' }}>
                Peso: <b style={{color: theme.gold}}>{m.weight}kg</b>
                <span style={{ float: 'right', color: '#666' }}>{new Date(m.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper styles
const inputStyle = (theme: any) => ({ width: '100%', padding: '12px', background: theme.input, border: `1px solid ${theme.border}`, color: 'white', borderRadius: '8px', marginBottom: '10px' });
const btnStyle = (theme: any) => ({ width: '100%', padding: '12px', background: theme.gold, border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginTop: '10px' });

export default DiaryPage;