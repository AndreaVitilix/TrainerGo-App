import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import api from '../services/api';

// --- COMPONENTE: BARRA STRUMENTI EDITOR (TipTap) ---
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
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))}>G</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))}>• Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))}>1. Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle(editor.isActive('blockquote'))}>Citazione</button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} style={btnStyle(false)}>Linea</button>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} style={btnStyle(false)}>↩</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} style={btnStyle(false)}>↪</button>
    </div>
  );
};

// --- COMPONENTE PRINCIPALE: DETTAGLIO ATLETA ---
const AthleteDetail = () => {
  const { id } = useParams(); // Prende l'ID dell'atleta dall'URL
  const navigate = useNavigate();
  
  // STATI
  const [profile, setProfile] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [tab, setTab] = useState<'info' | 'workout'>('info');
  const [newPlanTitle, setNewPlanTitle] = useState('');

  // CONFIGURAZIONE EDITOR
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        style: 'min-height: 300px; padding: 20px; outline: none; color: #333; background: white; border-radius: 0 0 12px 12px; font-family: sans-serif;'
      }
    },
  });

  // CARICAMENTO DATI
  const fetchData = async () => {
    try {
      // Carichiamo il profilo atleta
      const pRes = await api.get(`/Athletes/${id}`);
      setProfile(pRes.data);
      
      // Carichiamo le schede specifiche per questo atleta
      const wRes = await api.get(`/WorkoutPlans/athlete/${id}`);
      setPlans(wRes.data);
    } catch (err) {
      console.error("Errore nel caricamento dei dati atleta:", err);
    }
  };

  // Reset e ricaricamento quando cambia l'ID nell'URL
  useEffect(() => {
    setProfile(null);
    setPlans([]);
    fetchData();
  }, [id]);

  // SALVATAGGIO DATI TECNICI (Peso, Altezza, Note Coach)
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
      alert("Scheda Tecnica aggiornata con successo! ✅");
    } catch (err) {
      alert("Errore durante il salvataggio dei dati.");
    }
  };

  // PUBBLICAZIONE NUOVA SCHEDA
  const handleSavePlan = async () => {
    if (!newPlanTitle || !editor) return alert("Inserisci un titolo per la scheda!");
    try {
      // Passiamo l'athleteId preso dall'URL per associare la scheda correttamente
      await api.post('/WorkoutPlans', { 
        athleteId: id, 
        title: newPlanTitle, 
        htmlContent: editor.getHTML() 
      });

      alert("Allenamento pubblicato! 🔥");
      setNewPlanTitle('');
      editor.commands.setContent('');
      fetchData(); // Ricarica la lista per mostrare l'ultima inserita
    } catch (err) {
      alert("Errore durante la pubblicazione della scheda.");
    }
  };

  // TEMA E STILI
  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', border: '#27272a', inputBg: '#09090b', muted: '#a1a1aa' };
  const inputStyle = { width: '100%', padding: '14px', background: theme.inputBg, border: `1px solid ${theme.border}`, color: 'white', borderRadius: '10px', marginBottom: '15px', fontSize: '0.95rem' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: theme.gold, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px' };

  if (!profile) return <div style={{ background: theme.bg, minHeight: '100vh', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Caricamento dati atleta...</div>;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <button onClick={() => navigate('/atleti')} style={{ color: theme.gold, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: 600 }}>← TORNA ALLA LISTA ATLETI</button>
        <h1 style={{ marginBottom: '35px', fontSize: '2.5rem' }}>Gestione: <span style={{ color: theme.gold }}>{profile.user.nome} {profile.user.cognome}</span></h1>

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
          <button onClick={() => setTab('info')} style={{ flex: 1, padding: '18px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: tab === 'info' ? theme.gold : theme.card, color: tab === 'info' ? 'black' : 'white', fontWeight: 800, transition: '0.3s' }}>SCHEDA TECNICA</button>
          <button onClick={() => setTab('workout')} style={{ flex: 1, padding: '18px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: tab === 'workout' ? theme.gold : theme.card, color: tab === 'workout' ? 'black' : 'white', fontWeight: 800, transition: '0.3s' }}>PIANI ALLENAMENTO</button>
        </div>

        {/* CONTENUTO TAB: INFO */}
        {tab === 'info' ? (
          <div style={{ background: theme.card, padding: '35px', borderRadius: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div>
                <label style={labelStyle}>⚖️ Peso attuale (kg)</label>
                <input type="number" style={inputStyle} value={profile.weight || ''} onChange={e => setProfile({...profile, weight: parseFloat(e.target.value)})} placeholder="Esempio: 78.5" />
              </div>
              <div>
                <label style={labelStyle}>📏 Altezza (cm)</label>
                <input type="number" style={inputStyle} value={profile.height || ''} onChange={e => setProfile({...profile, height: parseFloat(e.target.value)})} placeholder="Esempio: 182" />
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={labelStyle}>🎯 Obiettivi dell'atleta</label>
              <textarea style={{ ...inputStyle, minHeight: '100px' }} value={profile.goals || ''} onChange={e => setProfile({...profile, goals: e.target.value})} placeholder="Es: Ipertrofia muscolare, definizione, miglioramento postura..." />
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={labelStyle}>🏋️ Attrezzatura disponibile</label>
              <textarea style={{ ...inputStyle, minHeight: '100px' }} value={profile.equipment || ''} onChange={e => setProfile({...profile, equipment: e.target.value})} placeholder="Es: Palestra commerciale completa, home gym con manubri e sbarra..." />
            </div>

            {/* SEPARATORE AREA COACH */}
            <div style={{ margin: '40px 0', borderTop: `1px solid ${theme.border}`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: theme.card, padding: '0 15px', fontSize: '0.7rem', color: theme.muted, letterSpacing: '1px', fontWeight: 700 }}>SOLO PER IL COACH</span>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ ...labelStyle, color: '#ff4444' }}>🔒 Note Private (L'atleta non vedrà queste note)</label>
              <textarea style={{ ...inputStyle, minHeight: '150px', background: '#1c1c10', border: '1px solid #33331a' }} value={profile.coachNotes || ''} onChange={e => setProfile({...profile, coachNotes: e.target.value})} placeholder="Inserisci qui valutazioni cliniche, appunti su infortuni passati o note caratteriali dell'atleta..." />
            </div>

            <button onClick={handleSaveProfile} style={{ background: theme.gold, color: 'black', padding: '20px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', width: '100%', fontSize: '1rem', textTransform: 'uppercase', boxShadow: `0 5px 15px ${theme.gold}44` }}>SALVA DATI TECNICI ✅</button>
          </div>
        ) : (
          /* CONTENUTO TAB: WORKOUT */
          <div>
            {/* EDITOR NUOVA SCHEDA */}
            <div style={{ background: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, marginBottom: '50px', padding: '30px' }}>
              <label style={labelStyle}>Titolo della Nuova Scheda</label>
              <input style={inputStyle} placeholder="Es: Mesociclo Forza - Settimana 1-4" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
              
              <label style={labelStyle}>Programma di Allenamento</label>
              <div style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
              </div>
              <button onClick={handleSavePlan} style={{ background: theme.gold, color: 'black', padding: '18px', width: '100%', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', marginTop: '30px', fontSize: '1rem' }}>PUBBLICA NUOVA SCHEDA 🔥</button>
            </div>

            {/* STORICO SCHEDE */}
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Storico Schede Pubblicate</h2>
            {plans.length === 0 ? (
              <p style={{ color: theme.muted, textAlign: 'center', padding: '40px', background: theme.card, borderRadius: '15px' }}>Nessuna scheda ancora pubblicata per questo atleta.</p>
            ) : (
              plans.map(plan => (
                <div key={plan.id} style={{ background: theme.card, padding: '30px', borderRadius: '15px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: theme.gold, fontSize: '1.2rem' }}>{plan.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: theme.muted }}>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div 
                    dangerouslySetInnerHTML={{ __html: plan.htmlContent }} 
                    style={{ color: '#e0e0e0', lineHeight: '1.7', fontSize: '0.95rem' }} 
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AthleteDetail;