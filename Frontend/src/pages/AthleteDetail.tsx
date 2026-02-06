import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import api from '../services/api';

// --- COMPONENTE TOOLBAR (Semplice ed efficace) ---
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnStyle = (active: boolean) => ({
    padding: '5px 10px',
    marginRight: '5px',
    backgroundColor: active ? '#fbbf24' : '#333',
    color: active ? 'black' : 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold' as const
  });

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #27272a', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))}>• Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))}>1. Lista</button>
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

  // --- CONFIGURAZIONE TIPTAP ---
  const editor = useEditor({
    extensions: [StarterKit],
    content: '', // Inizia vuoto
    editorProps: {
      attributes: {
        style: 'min-height: 200px; padding: 15px; outline: none; color: black; line-height: 1.5;',
      },
    },
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

  const handleSavePlan = async () => {
    if (!newPlanTitle || !editor) return alert("Metti un titolo!");
    const htmlContent = editor.getHTML(); // Prende l'HTML formattato
    
    try {
      await api.post('/WorkoutPlans', {
        athleteId: id,
        title: newPlanTitle,
        htmlContent: htmlContent
      });
      alert("Scheda creata! 🚀");
      setNewPlanTitle('');
      editor.commands.setContent(''); // Svuota l'editor
      fetchData();
    } catch (err) { alert("Errore"); }
  };

  // Stili
  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', border: '#27272a', inputBg: '#222', textMuted: '#888' };
  const inputStyle = { width: '100%', padding: '12px', background: theme.inputBg, border: `1px solid ${theme.border}`, color: 'white', borderRadius: '8px', marginBottom: '15px' };

  if (!profile) return <div style={{ background: theme.bg, minHeight: '100vh', color: 'white', padding: '20px' }}>Caricamento...</div>;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/atleti')} style={{ color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px' }}>← Torna agli Atleti</button>
        <h1 style={{ color: theme.gold, marginBottom: '25px' }}>{profile.user.nome} {profile.user.cognome}</h1>

        {/* TAB SWITCHER */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setTab('info')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: tab === 'info' ? theme.gold : theme.card, color: tab === 'info' ? 'black' : 'white', fontWeight: 700 }}>SCHEDA TECNICA</button>
          <button onClick={() => setTab('workout')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: tab === 'workout' ? theme.gold : theme.card, color: tab === 'workout' ? 'black' : 'white', fontWeight: 700 }}>ALLENAMENTI</button>
        </div>

        {tab === 'info' ? (
          <div style={{ background: theme.card, padding: '30px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
             {/* ... Stessa logica della scheda tecnica di prima ... */}
             <p style={{color: theme.textMuted}}>Visualizzazione Dati Fisici...</p>
             <button onClick={() => alert("Salvataggio Dati Fisici...")} style={{background: theme.gold, padding: '12px', borderRadius: '8px', border:'none', fontWeight: 700, cursor:'pointer'}}>SALVA DATI</button>
          </div>
        ) : (
          <div>
            {/* NUOVA SCHEDA CON TIPTAP */}
            <div style={{ background: theme.card, borderRadius: '15px', border: `1px solid ${theme.border}`, overflow: 'hidden', marginBottom: '40px' }}>
              <div style={{ padding: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Nuovo Allenamento</h3>
                <input placeholder="Titolo (es. Forza Esplosiva L1)" style={inputStyle} value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
                
                {/* EDITOR BOX */}
                <div style={{ background: 'white', borderRadius: '8px', border: `1px solid ${theme.border}`, minHeight: '300px' }}>
                  <MenuBar editor={editor} />
                  <EditorContent editor={editor} />
                </div>

                <button onClick={handleSavePlan} style={{ background: theme.gold, color: 'black', padding: '15px', width: '100%', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginTop: '20px' }}>
                  PUBBLICA ALLENAMENTO 🔥
                </button>
              </div>
            </div>

            {/* STORICO */}
            <h2 style={{ color: theme.gold }}>Storico Schede</h2>
            {plans.map(plan => (
              <div key={plan.id} style={{ background: theme.card, padding: '25px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>{plan.title}</h4>
                  <small style={{ color: '#888' }}>{new Date(plan.createdAt).toLocaleDateString()}</small>
                </div>
                {/* Visualizzazione HTML salvato */}
                <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: plan.htmlContent }} style={{ color: '#ccc', lineHeight: '1.6' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AthleteDetail;