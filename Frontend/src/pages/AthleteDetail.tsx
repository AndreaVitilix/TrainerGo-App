import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import api from '../services/api';

// --- COMPONENTE: BARRA STRUMENTI EDITOR ---
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const btnStyle = (active: boolean) => ({
    padding: '8px 12px', marginRight: '5px', marginBottom: '5px',
    backgroundColor: active ? '#fbbf24' : '#27272a',
    color: active ? 'black' : 'white', border: 'none', borderRadius: '4px',
    cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '0.85rem', transition: 'all 0.2s'
  });

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #27272a', display: 'flex', gap: '2px', flexWrap: 'wrap', background: '#18181b' }}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))}>G</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))}>• Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))}>1. Lista</button>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} style={btnStyle(false)}>↩</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} style={btnStyle(false)}>↪</button>
    </div>
  );
};

// --- COMPONENTE PRINCIPALE ---
const AthleteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATI DATI ---
  const [profile, setProfile] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  
  // --- STATI UI ---
  const [tab, setTab] = useState<'info' | 'workout' | 'diary'>('info'); // Gestisce le 3 tab
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: { attributes: { style: 'min-height: 300px; padding: 20px; outline: none; color: #333; background: white; border-radius: 0 0 12px 12px; font-family: sans-serif;' } },
  });

  // --- CARICAMENTO DATI ---
  const fetchData = async () => {
    try {
      // 1. Profilo e Schede
      const pRes = await api.get(`/Athletes/${id}`);
      setProfile(pRes.data);
      const wRes = await api.get(`/WorkoutPlans/athlete/${id}`);
      setPlans(wRes.data);

      // 2. Dati Diario
      const resW = await api.get(`/Diary/workout/${id}`);
      const resM = await api.get(`/Diary/measurement/${id}`);
      setWorkoutLogs(resW.data);
      setMeasurements(resM.data);
    } catch (err) { console.error("Errore fetch:", err); }
  };

  useEffect(() => {
    setProfile(null);
    setPlans([]);
    setWorkoutLogs([]);
    setMeasurements([]);
    fetchData();
  }, [id]);

  // --- FUNZIONI SALVATAGGIO ---
  const handleSaveProfile = async () => {
    try {
      const dataToSave = { 
        id: profile.id, 
        weight: profile.weight, 
        height: profile.height, 
        goals: profile.goals, 
        equipment: profile.equipment, 
        coachNotes: profile.coachNotes 
      };
      await api.put('/Athletes', dataToSave);
      alert("Scheda Tecnica aggiornata! ✅");
    } catch (err) { alert("Errore salvataggio profilo"); }
  };

  const handleSavePlan = async () => {
    if (!newPlanTitle || !editor) return alert("Inserisci un titolo!");
    const payload = { athleteId: id, title: newPlanTitle, htmlContent: editor.getHTML() };
    try {
      if (editingPlanId) {
        await api.put(`/WorkoutPlans/${editingPlanId}`, payload);
        alert("Scheda aggiornata! ✅");
      } else {
        await api.post('/WorkoutPlans', payload);
        alert("Nuova scheda pubblicata! 🔥");
      }
      setEditingPlanId(null); setNewPlanTitle(''); editor.commands.setContent('');
      fetchData();
    } catch (err) { alert("Errore salvataggio scheda"); }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm("Eliminare questa scheda?")) return;
    try { await api.delete(`/WorkoutPlans/${planId}`); fetchData(); } catch (err) { alert("Errore"); }
  };

  const handleEditClick = (plan: any) => {
    setEditingPlanId(plan.id);
    setNewPlanTitle(plan.title);
    editor?.commands.setContent(plan.htmlContent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- TEMA E STILI ---
  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', border: '#27272a', inputBg: '#09090b', muted: '#a1a1aa', danger: '#ef4444' };
  const inputStyle = { width: '100%', padding: '14px', background: theme.inputBg, border: `1px solid ${theme.border}`, color: 'white', borderRadius: '10px', marginBottom: '15px', fontSize: '0.95rem' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: theme.gold, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px' };

  if (!profile) return <div style={{ background: theme.bg, minHeight: '100vh', color: 'white', padding: '20px' }}>Caricamento...</div>;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <button onClick={() => navigate('/atleti')} style={{ color: theme.gold, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: 600 }}>← TORNA ALLA LISTA</button>
        <h1 style={{ marginBottom: '35px' }}>Gestione: <span style={{ color: theme.gold }}>{profile.user.nome} {profile.user.cognome}</span></h1>

        {/* --- NAVIGATION TABS (3 BOTTONI) --- */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
          <button onClick={() => setTab('info')} style={{ flex: 1, padding: '18px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: tab === 'info' ? theme.gold : theme.card, color: tab === 'info' ? 'black' : 'white', fontWeight: 800, transition: '0.2s' }}>SCHEDA TECNICA</button>
          <button onClick={() => setTab('workout')} style={{ flex: 1, padding: '18px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: tab === 'workout' ? theme.gold : theme.card, color: tab === 'workout' ? 'black' : 'white', fontWeight: 800, transition: '0.2s' }}>PIANI ALLENAMENTO</button>
          <button onClick={() => setTab('diary')} style={{ flex: 1, padding: '18px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: tab === 'diary' ? theme.gold : theme.card, color: tab === 'diary' ? 'black' : 'white', fontWeight: 800, transition: '0.2s' }}>DIARIO ATLETA</button>
        </div>

        {/* --- TAB 1: INFO COMPLETA (Attrezzatura e Note incluse!) --- */}
        {tab === 'info' && (
          <div style={{ background: theme.card, padding: '35px', borderRadius: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div>
                <label style={labelStyle}>⚖️ Peso attuale (kg)</label>
                <input type="number" style={inputStyle} value={profile.weight || ''} onChange={e => setProfile({...profile, weight: parseFloat(e.target.value)})} placeholder="Es: 75.5" />
              </div>
              <div>
                <label style={labelStyle}>📏 Altezza (cm)</label>
                <input type="number" style={inputStyle} value={profile.height || ''} onChange={e => setProfile({...profile, height: parseFloat(e.target.value)})} placeholder="Es: 180" />
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={labelStyle}>🎯 Obiettivi dell'atleta</label>
              <textarea style={{ ...inputStyle, minHeight: '100px' }} value={profile.goals || ''} onChange={e => setProfile({...profile, goals: e.target.value})} placeholder="Es: Ipertrofia, definizione..." />
            </div>

            {/* CAMPO ATTREZZATURA (RIPRISTINATO) */}
            <div style={{ marginTop: '10px' }}>
              <label style={labelStyle}>🏋️ Attrezzatura disponibile</label>
              <textarea style={{ ...inputStyle, minHeight: '100px' }} value={profile.equipment || ''} onChange={e => setProfile({...profile, equipment: e.target.value})} placeholder="Es: Palestra completa, manubri a casa..." />
            </div>

            <div style={{ margin: '40px 0', borderTop: `1px solid ${theme.border}`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: theme.card, padding: '0 15px', fontSize: '0.7rem', color: theme.muted, letterSpacing: '1px', fontWeight: 700 }}>SOLO PER IL COACH</span>
            </div>

            {/* CAMPO NOTE PRIVATE (RIPRISTINATO) */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ ...labelStyle, color: '#ff4444' }}>🔒 Note Private (L'atleta non le vede)</label>
              <textarea style={{ ...inputStyle, minHeight: '150px', background: '#1c1c10', border: '1px solid #33331a' }} value={profile.coachNotes || ''} onChange={e => setProfile({...profile, coachNotes: e.target.value})} placeholder="Note su infortuni, carattere, pagamenti..." />
            </div>

            <button onClick={handleSaveProfile} style={{ background: theme.gold, color: 'black', padding: '20px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', width: '100%', fontSize: '1rem', textTransform: 'uppercase', boxShadow: `0 5px 15px ${theme.gold}44` }}>SALVA DATI TECNICI ✅</button>
          </div>
        )}

        {/* --- TAB 2: WORKOUT (Editor + Lista) --- */}
        {tab === 'workout' && (
          <div>
            <div style={{ background: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, marginBottom: '50px', padding: '30px' }}>
              <h3 style={{marginTop: 0, color: editingPlanId ? theme.gold : 'white'}}>
                {editingPlanId ? "✏️ Modifica Scheda" : "➕ Crea Nuova Scheda"}
              </h3>
              <input style={inputStyle} placeholder="Titolo Scheda (es: Mesociclo 1)" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
              
              <div style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
              </div>
              
              <div style={{display: 'flex', gap: '10px', marginTop: '25px'}}>
                <button onClick={handleSavePlan} style={{ flex: 2, background: theme.gold, color: 'black', padding: '18px', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                  {editingPlanId ? "AGGIORNA SCHEDA ✅" : "PUBBLICA SCHEDA 🔥"}
                </button>
                {editingPlanId && (
                  <button onClick={() => { setEditingPlanId(null); setNewPlanTitle(''); editor?.commands.setContent(''); }} style={{ flex: 1, background: '#333', color: 'white', padding: '18px', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                    Annulla
                  </button>
                )}
              </div>
            </div>

            {/* LISTA SCHEDE */}
            {plans.map(plan => (
              <div key={plan.id} style={{ background: theme.card, padding: '30px', borderRadius: '15px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, color: theme.gold, fontSize: '1.2rem' }}>{plan.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: theme.muted }}>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => handleEditClick(plan)} style={{background: 'none', border: `1px solid ${theme.muted}`, color: theme.muted, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}}>✏️ Modifica</button>
                    <button onClick={() => handleDeletePlan(plan.id)} style={{background: 'none', border: `1px solid ${theme.danger}`, color: theme.danger, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}}>🗑️ Elimina</button>
                  </div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: plan.htmlContent }} style={{ color: '#e0e0e0', lineHeight: '1.7', fontSize: '0.95rem' }} />
              </div>
            ))}
          </div>
        )}

        {/* --- TAB 3: DIARIO (Nuova funzionalità) --- */}
        {tab === 'diary' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            {/* STORICO CARICHI */}
            <div style={{ background: theme.card, padding: '25px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <h3 style={{ color: theme.gold, marginTop: 0 }}>💪 Storico Carichi</h3>
              {workoutLogs.length === 0 ? <p style={{color: theme.muted, fontStyle: 'italic'}}>L'atleta non ha ancora segnato allenamenti.</p> : (
                <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                  {workoutLogs.map(log => (
                    <div key={log.id} style={{ padding: '15px 0', borderBottom: `1px solid ${theme.border}` }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{log.exerciseName}</div>
                      <div style={{ fontSize: '0.9rem', color: theme.muted, marginTop: '4px' }}>
                        {log.sets} set x {log.reps} rep — <span style={{color: theme.gold, fontWeight: 'bold'}}>{log.weightLifted} kg</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '5px' }}>📅 {new Date(log.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ANDAMENTO PESO */}
            <div style={{ background: theme.card, padding: '25px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <h3 style={{ color: theme.gold, marginTop: 0 }}>⚖️ Andamento Peso</h3>
              {measurements.length === 0 ? <p style={{color: theme.muted, fontStyle: 'italic'}}>Nessuna pesata registrata.</p> : (
                <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                  {measurements.map(m => (
                    <div key={m.id} style={{ padding: '15px 0', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>{m.weight} kg</div>
                        {m.notes && <div style={{ fontSize: '0.8rem', color: theme.muted, fontStyle: 'italic' }}>"{m.notes}"</div>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>📅 {new Date(m.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AthleteDetail;