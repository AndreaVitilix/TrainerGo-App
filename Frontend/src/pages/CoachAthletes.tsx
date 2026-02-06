import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CoachAthletes = () => {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const fetchAthletes = async () => {
    try {
      const res = await api.get('/Athletes/my-athletes');
      setAthletes(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAthletes(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/Athletes/add-by-email', { email });
      alert("Atleta aggiunto!");
      setEmail('');
      fetchAthletes();
    } catch (err: any) { alert(err.response?.data || "Errore"); }
  };

  // Stile veloce dark
  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', border: '#27272a' };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate('/corsi')} style={{marginBottom:'20px', background:'none', border:'none', color:'#aaa', cursor:'pointer'}}>← Torna alla Dashboard</button>
        <h1 style={{ color: theme.gold }}>I Miei Atleti</h1>

        {/* Form Aggiungi */}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
          <input 
            value={email} onChange={e => setEmail(e.target.value)} placeholder="Email atleta..." required 
            style={{ padding: '12px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: theme.card, color: 'white', flex: 1 }}
          />
          <button type="submit" style={{ background: theme.gold, border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ SEGUI</button>
        </form>

        {/* Lista */}
        <div style={{ display: 'grid', gap: '15px' }}>
          {athletes.map(a => (
            <div key={a.userId} onClick={() => navigate(`/atleta/${a.userId}`)} 
                 style={{ background: theme.card, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, cursor: 'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{a.fullName}</h3>
                <small style={{ color: '#aaa' }}>{a.email}</small>
              </div>
              <span style={{color: theme.gold}}>Gestisci →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoachAthletes;