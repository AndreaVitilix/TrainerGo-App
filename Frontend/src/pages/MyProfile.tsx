import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [tab, setTab] = useState<'info' | 'workout'>('info');

  // --- CARICAMENTO DATI ---
  const fetchData = async () => {
    try {
      const pRes = await api.get('/Athletes/my-profile');
      setProfile(pRes.data);
      const wRes = await api.get('/WorkoutPlans/my-plans');
      setPlans(wRes.data);
    } catch (err) { console.error("Errore caricamento", err); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- AGGIORNAMENTO DATI FISICI ---
  const handleUpdateSelf = async () => {
    try {
      const dataToSave = {
        id: profile.id,
        weight: profile.weight,
        height: profile.height,
        goals: profile.goals,
        equipment: profile.equipment,
        weeklyWorkouts: profile.weeklyWorkouts,
        coachNotes: profile.coachNotes // Restituiamo le note così come sono
      };
      await api.put('/Athletes', dataToSave);
      alert("Dati aggiornati correttamente! 💪");
    } catch (err) { alert("Errore durante l'aggiornamento."); }
  };

  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', border: '#27272a', inputBg: '#09090b' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: 600 };
  const inputStyle = { width: '100%', padding: '12px', background: theme.inputBg, border: `1px solid ${theme.border}`, color: 'white', borderRadius: '8px', marginBottom: '20px' };

  if (!profile) return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: 'white', display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column' }}>
       <p>Il tuo profilo non è ancora stato attivato dal coach.</p>
       <button onClick={() => navigate('/corsi')} style={{color: theme.gold, background:'none', border:'none', cursor:'pointer', fontWeight: 700}}>TORNA AI CORSI</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate('/corsi')} style={{ color: theme.gold, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: 600 }}>← HOME</button>
        
        <h1 style={{ marginBottom: '10px' }}>Ciao, <span style={{ color: theme.gold }}>{profile.user.nome}</span>!</h1>
        <p style={{ color: '#71717a', marginBottom: '30px' }}>Gestisci i tuoi parametri e consulta le tue schede.</p>

        {/* SWITCH TAB */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setTab('info')} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: tab === 'info' ? theme.gold : theme.card, color: tab === 'info' ? 'black' : 'white', fontWeight: 800 }}>MIA SCHEDA</button>
          <button onClick={() => setTab('workout')} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: tab === 'workout' ? theme.gold : theme.card, color: tab === 'workout' ? 'black' : 'white', fontWeight: 800 }}>MIEI ALLENAMENTI</button>
        </div>

        {tab === 'info' ? (
          <div style={{ background: theme.card, padding: '30px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
            <h3 style={{marginTop:0, marginBottom:'20px'}}>I Miei Parametri</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Peso (kg)</label>
                <input type="number" style={inputStyle} value={profile.weight} onChange={e => setProfile({...profile, weight: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label style={labelStyle}>Altezza (cm)</label>
                <input type="number" style={inputStyle} value={profile.height} onChange={e => setProfile({...profile, height: parseFloat(e.target.value)})} />
              </div>
            </div>
            <label style={labelStyle}>Il mio obiettivo</label>
            <input style={inputStyle} value={profile.goals} onChange={e => setProfile({...profile, goals: e.target.value})} />
            <label style={labelStyle}>Cosa ho a casa (Attrezzatura)</label>
            <textarea style={{ ...inputStyle, minHeight: '80px' }} value={profile.equipment} onChange={e => setProfile({...profile, equipment: e.target.value})} />
            <button onClick={handleUpdateSelf} style={{ background: theme.gold, color: 'black', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer', width: '100%' }}>SALVA MODIFICHE</button>
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Allenamenti Ricevuti</h3>
            {plans.length === 0 ? <p style={{color:'#71717a'}}>Nessuna scheda disponibile.</p> : (
              plans.map(plan => (
                <div key={plan.id} style={{ background: theme.card, padding: '25px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: theme.gold }}>{plan.title}</h4>
                    <span style={{ color: '#71717a', fontSize: '0.85rem' }}>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: plan.htmlContent }} style={{ lineHeight: '1.7', color: '#e4e4e7' }} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;