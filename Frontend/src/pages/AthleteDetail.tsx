import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Importa gli stili dell'editor
import api from '../services/api';

const AthleteDetail = () => {
  const { id } = useParams(); // ID dell'atleta (User ID)
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [tab, setTab] = useState<'info' | 'workout'>('info');

  // Stato per nuova scheda
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [editorContent, setEditorContent] = useState(''); // HTML del word editor

  const fetchData = async () => {
    try {
        const pRes = await api.get(`/Athletes/${id}`);
        setProfile(pRes.data);
        const wRes = await api.get(`/WorkoutPlans/athlete/${id}`);
        setPlans(wRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSaveProfile = async () => {
     try {
         await api.put('/Athletes', profile);
         alert("Scheda tecnica aggiornata!");
     } catch (err) { alert("Errore salvataggio"); }
  };

  const handleSavePlan = async () => {
      if(!newPlanTitle) return alert("Metti un titolo!");
      try {
          await api.post('/WorkoutPlans', {
              athleteId: id,
              title: newPlanTitle,
              htmlContent: editorContent // Salviamo l'HTML generato da Quill
          });
          alert("Scheda creata!");
          setNewPlanTitle('');
          setEditorContent('');
          fetchData();
      } catch (err) { alert("Errore"); }
  };

  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', border: '#27272a', inputBg: '#222' };
  const inputStyle = { width: '100%', padding: '10px', background: theme.inputBg, border: `1px solid ${theme.border}`, color: 'white', borderRadius: '4px', marginBottom: '15px' };

  if (!profile) return <div style={{background:theme.bg, minHeight:'100vh', color:'white', padding:'20px'}}>Caricamento...</div>;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/atleti')} style={{color:'#aaa', background:'none', border:'none', cursor:'pointer', marginBottom:'10px'}}>← Indietro</button>
        <h1 style={{color: theme.gold, margin:'0 0 20px 0'}}>{profile.user.nome} {profile.user.cognome}</h1>

        {/* TABS */}
        <div style={{display:'flex', gap:'10px', marginBottom:'30px'}}>
            <button onClick={() => setTab('info')} style={{flex:1, padding:'10px', background: tab==='info' ? theme.gold : theme.card, color: tab==='info'?'black':'white', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>SCHEDA TECNICA</button>
            <button onClick={() => setTab('workout')} style={{flex:1, padding:'10px', background: tab==='workout' ? theme.gold : theme.card, color: tab==='workout'?'black':'white', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>ALLENAMENTI</button>
        </div>

        {tab === 'info' ? (
            <div style={{background: theme.card, padding:'30px', borderRadius:'12px', border:`1px solid ${theme.border}`}}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                    <div>
                        <label>Peso (kg)</label>
                        <input type="number" style={inputStyle} value={profile.weight} onChange={e => setProfile({...profile, weight: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                        <label>Altezza (cm)</label>
                        <input type="number" style={inputStyle} value={profile.height} onChange={e => setProfile({...profile, height: parseFloat(e.target.value)})} />
                    </div>
                </div>
                <label>Obiettivo</label>
                <input style={inputStyle} value={profile.goals} onChange={e => setProfile({...profile, goals: e.target.value})} />
                
                <label>Attrezzatura disponibile</label>
                <textarea style={{...inputStyle, minHeight:'80px'}} value={profile.equipment} onChange={e => setProfile({...profile, equipment: e.target.value})} />
                
                <hr style={{borderColor: theme.border, margin:'20px 0'}} />
                <label style={{color: theme.gold}}>🔒 NOTE PRIVATE COACH (Solo tu vedi questo)</label>
                <textarea style={{...inputStyle, minHeight:'100px', background:'#2a2a10'}} value={profile.coachNotes} onChange={e => setProfile({...profile, coachNotes: e.target.value})} />

                <button onClick={handleSaveProfile} style={{background: theme.gold, color:'black', padding:'12px 24px', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', marginTop:'10px'}}>SALVA PROFILO</button>
            </div>
        ) : (
            <div>
                {/* CREA NUOVA SCHEDA */}
                <div style={{background: theme.card, padding:'20px', borderRadius:'12px', border:`1px solid ${theme.border}`, marginBottom:'30px'}}>
                    <h3 style={{marginTop:0}}>Nuova Scheda Allenamento</h3>
                    <input placeholder="Titolo (es. Mesociclo 1 - Ipertrofia)" style={inputStyle} value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
                    
                    {/* EDITOR TIPO WORD */}
                    <div style={{background:'white', color:'black', borderRadius:'6px', marginBottom:'15px'}}>
                        <ReactQuill theme="snow" value={editorContent} onChange={setEditorContent} style={{height:'250px', marginBottom:'50px'}} />
                    </div>

                    <button onClick={handleSavePlan} style={{background: theme.gold, color:'black', padding:'12px', width:'100%', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>PUBBLICA SCHEDA</button>
                </div>

                {/* STORICO SCHEDE */}
                <h3>Storico Schede</h3>
                {plans.map(plan => (
                    <div key={plan.id} style={{background: theme.card, padding:'20px', borderRadius:'8px', marginBottom:'15px', border:`1px solid ${theme.border}`}}>
                        <div style={{display:'flex', justifyContent:'space-between', borderBottom:`1px solid ${theme.border}`, paddingBottom:'10px', marginBottom:'10px'}}>
                            <strong style={{fontSize:'1.1rem'}}>{plan.title}</strong>
                            <span style={{color:'#aaa'}}>{new Date(plan.createdAt).toLocaleDateString()}</span>
                        </div>
                        {/* Renderizza l'HTML salvato */}
                        <div dangerouslySetInnerHTML={{ __html: plan.htmlContent }} style={{lineHeight:'1.6'}} />
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AthleteDetail;