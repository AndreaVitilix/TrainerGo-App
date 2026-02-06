import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import api from '../services/api';

// --- BARRA STRUMENTI EDITOR ---
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnStyle = (active: boolean) => ({
    padding: '8px 12px',
    marginRight: '5px',
    marginBottom: '5px',
    backgroundColor: active ? '#fbbf24' : '#27272a',
    color: active ? 'black' : 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '0.85rem',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #27272a', display: 'flex', gap: '2px', flexWrap: 'wrap', background: '#18181b' }}>
      {/* Formattazione Testo */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))}>G</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))}>I</button>
      
      {/* Titoli (Ottimi per separare i gruppi muscolari) */}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))}>Titolo</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btnStyle(editor.isActive('heading', { level: 3 }))}>Sottotitolo</button>

      {/* Liste */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))}>• Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))}>1. Lista</button>

      {/* Elementi di impaginazione */}
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle(editor.isActive('blockquote'))}>Citazione</button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} style={btnStyle(false)}>Linea Divisoria</button>
      
      {/* Utility */}
      <button type="button" onClick={() => editor.chain().focus().undo().run()} style={btnStyle(false)}>↩</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} style={btnStyle(false)}>↪</button>
    </div>
  );
};

const AthleteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [tab, setTab] = useState<'info' | 'workout'>('info');
  const [newPlanTitle, setNewPlanTitle] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: { attributes: { style: 'min-height: 250px; padding: 20px; outline: none; color: black; background: white; border-radius: 0 0 8px 8px;' } },
  });

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
      const dataToSave = { id: profile.id, weight: profile.weight, height: profile.height, goals: profile.goals, equipment: profile.equipment, weeklyWorkouts: profile.weeklyWorkouts, coachNotes: profile.coachNotes };
      await api.put('/Athletes', dataToSave);
      alert("Profilo Atleta Salvato! ✅");
    } catch (err) { alert("Errore"); }
  };

  const handleSavePlan = async () => {
    if (!newPlanTitle || !editor) return alert("Inserisci un titolo");
    try {
      await api.post('/WorkoutPlans', { athleteId: id, title: newPlanTitle, htmlContent: editor.getHTML() });
      alert("Scheda Pubblicata! 🔥");
      setNewPlanTitle('');
      editor.commands.setContent('');
      fetchData();
    } catch (err) { alert("Errore"); }
  };

  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', border: '#27272a', inputBg: '#09090b' };
  const inputStyle = { width: '100%', padding: '12px', background: theme.inputBg, border: `1px solid ${theme.border}`, color: 'white', borderRadius: '8px', marginBottom: '15px' };

  if (!profile) return <div style={{ background: theme.bg, minHeight: '100vh', color: 'white', padding: '20px' }}>Caricamento...</div>;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/atleti')} style={{ color: theme.gold, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: 600 }}>← TORNA ALLA LISTA</button>
        <h1 style={{ marginBottom: '30px' }}>Gestione: <span style={{ color: theme.gold }}>{profile.user.nome} {profile.user.cognome}</span></h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setTab('info')} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: tab === 'info' ? theme.gold : theme.card, color: tab === 'info' ? 'black' : 'white', fontWeight: 800 }}>SCHEDA TECNICA</button>
          <button onClick={() => setTab('workout')} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: tab === 'workout' ? theme.gold : theme.card, color: tab === 'workout' ? 'black' : 'white', fontWeight: 800 }}>ALLENAMENTI</button>
        </div>

        {tab === 'info' ? (
          <div style={{ background: theme.card, padding: '30px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <input type="number" style={inputStyle} value={profile.weight} onChange={e => setProfile({...profile, weight: parseFloat(e.target.value)})} placeholder="Peso (kg)" />
              <input type="number" style={inputStyle} value={profile.height} onChange={e => setProfile({...profile, height: parseFloat(e.target.value)})} placeholder="Altezza (cm)" />
            </div>
            <textarea style={{ ...inputStyle, minHeight: '100px' }} value={profile.equipment} onChange={e => setProfile({...profile, equipment: e.target.value})} placeholder="Attrezzatura atleta..." />
            <div style={{ margin: '20px 0', borderTop: `1px solid ${theme.border}` }}></div>
            <label style={{color: theme.gold, display:'block', marginBottom:'10px'}}>🔒 NOTE PRIVATE COACH</label>
            <textarea style={{ ...inputStyle, minHeight: '120px', background: '#1c1c10' }} value={profile.coachNotes} onChange={e => setProfile({...profile, coachNotes: e.target.value})} placeholder="Scrivi qui valutazioni riservate..." />
            <button onClick={handleSaveProfile} style={{ background: theme.gold, color: 'black', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer', width: '100%' }}>SALVA PROFILO COMPLETO</button>
          </div>
        ) : (
          <div>
            <div style={{ background: theme.card, borderRadius: '15px', border: `1px solid ${theme.border}`, marginBottom: '40px', padding: '25px' }}>
              <input style={inputStyle} placeholder="Titolo Scheda (es. Mesociclo 1)" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
              <div style={{ border: `1px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
              </div>
              <button onClick={handleSavePlan} style={{ background: theme.gold, color: 'black', padding: '15px', width: '100%', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginTop: '25px' }}>PUBBLICA ALLENAMENTO</button>
            </div>
            {plans.map(plan => (
              <div key={plan.id} style={{ background: theme.card, padding: '25px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h4 style={{ margin: '0 0 10px 0', color: theme.gold }}>{plan.title}</h4>
                <div dangerouslySetInnerHTML={{ __html: plan.htmlContent }} style={{ color: '#ccc' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AthleteDetail;