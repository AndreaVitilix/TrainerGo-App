import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Course {
  id: string;
  name: string;
  instructor: string;
  priceMonthly: number;
  priceType: string;
  schedule: string;
  description: string;
  coachId: string; // Utile per sapere di chi è
}

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // STATO UTENTE
  const userRole = localStorage.getItem('userRole'); // 'Coach' o 'User'

  // Form (Solo per Coach)
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '', instructor: '', priceMonthly: 50, priceType: 'Mensile', schedule: '', description: ''
  });

  // CARICAMENTO
  const fetchCourses = async () => {
    try {
      // Se sei Coach, l'API ti dà i TUOI corsi.
      // Se sei User, dovremmo avere un'API che ci dà TUTTI i corsi disponibili.
      // NOTA: Per ora l'API "GetMyCourses" filtra. 
      // Se sei USER, l'API dovrebbe darti TUTTO. 
      // *Importante*: Se l'User vede vuoto è perché l'API backend filtrava su "MyCourses".
      // Per far funzionare questo step, assumiamo che l'API backend sia permissiva o che tu abbia modificato il controller
      // per dare "Tutti i corsi" agli User e "I miei" ai Coach.
      // Per ora usiamo quello che c'è:
      const response = await api.get('/Courses');
      setCourses(response.data);
    } catch (error) {
      console.error("Errore fetch", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // --- AZIONE ISCRIVITI (Per Atleti) ---
  const handleJoin = async (courseId: string) => {
    if(!window.confirm("Vuoi iscriverti a questo corso?")) return;
    
    try {
        await api.post(`/Enrollments/join/${courseId}`);
        alert("🎉 Iscrizione completata con successo!");
    } catch (error: any) {
        alert(error.response?.data || "Errore durante l'iscrizione. Forse sei già iscritto?");
    }
  };

  // --- AZIONI COACH ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) await api.put('/Courses', formData);
      else await api.post('/Courses', formData);
      setIsModalOpen(false);
      fetchCourses();
    } catch (error) { alert("Errore salvataggio."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare?")) return;
    try {
      await api.delete(`/Courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) { alert("Errore eliminazione."); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- TEMA DARK & GOLD ---
  const theme = {
    bg: '#09090b', cardBg: '#18181b', textMain: '#fafafa', textMuted: '#a1a1aa',
    accent: '#fbbf24', border: '#27272a', danger: '#ef4444',
  };

  const styles = {
    page: { minHeight: '100vh', backgroundColor: theme.bg, color: theme.textMain, fontFamily: "'Inter', sans-serif" },
    header: { background: 'rgba(24, 24, 27, 0.9)', borderBottom: `1px solid ${theme.border}`, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 10 },
    brand: { fontSize: '1.25rem', fontWeight: 800, color: theme.accent, letterSpacing: '1px', textTransform: 'uppercase' as const },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    topSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' },
    titleMain: { margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em', color: 'white' },
    
    btnGold: { backgroundColor: theme.accent, color: 'black', padding: '12px 24px', borderRadius: '4px', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' as const },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
    card: { backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const },
    cardHeader: { padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'white' },
    priceBadge: { backgroundColor: 'rgba(251, 191, 36, 0.15)', color: theme.accent, border: `1px solid rgba(251, 191, 36, 0.3)`, padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 },
    cardBody: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' as const },
    description: { color: theme.textMuted, fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '25px', flex: 1 },
    
    // BOTTONI
    actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' },
    btnEdit: { background: '#27272a', color: 'white', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 },
    btnDelete: { background: 'rgba(239, 68, 68, 0.1)', color: theme.danger, padding: '10px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: 600 },
    
    // BOTTONE JOIN (Pieno, Dorato, Largo)
    btnJoin: { width: '100%', backgroundColor: theme.accent, color: 'black', padding: '14px', borderRadius: '6px', border: 'none', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' as const, fontSize: '0.9rem', marginTop: 'auto', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)' },

    // Modale (Semplificata per brevità)
    modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContent: { background: '#18181b', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', border: `1px solid ${theme.border}` },
    input: { width: '100%', padding: '12px', backgroundColor: '#09090b', border: `1px solid ${theme.border}`, borderRadius: '6px', color: 'white', marginBottom: '15px' }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>TRAINER<span style={{color: 'white'}}>GO</span></div>
        <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
             <span style={{color: theme.textMuted, fontSize: '0.9rem'}}>Logged as: <strong style={{color:'white'}}>{userRole}</strong></span>
             <button onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>LOGOUT</button>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.topSection}>
          <div>
            <h1 style={styles.titleMain}>{userRole === 'Coach' ? 'Gestione Corsi' : 'Corsi Disponibili'}</h1>
            <p style={{ margin: '10px 0 0 0', color: theme.textMuted }}>
              {userRole === 'Coach' ? 'Crea e gestisci i tuoi programmi.' : 'Scegli il tuo prossimo allenamento.'}
            </p>
          </div>
          {/* SOLO IL COACH PUÒ CREARE */}
          {userRole === 'Coach' && (
              <button onClick={() => { setFormData({}); setIsModalOpen(true); }} style={styles.btnGold}>+ Crea Corso</button>
          )}
        </div>

        {isLoading ? ( <div style={{textAlign:'center', color: theme.textMuted}}>Caricamento...</div> ) : (
          <div style={styles.grid}>
            {courses.length === 0 ? <p style={{color: theme.textMuted}}>Nessun corso disponibile al momento.</p> : 
             courses.map((course) => (
              <div key={course.id} style={styles.card}>
                <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{course.name}</h3>
                    <span style={styles.priceBadge}>{course.priceMonthly}€</span>
                </div>
                <div style={styles.cardBody}>
                    <p style={{color: theme.accent, fontSize:'0.9rem', fontWeight:600, marginBottom:'5px'}}>COACH: {course.instructor}</p>
                    <p style={{color: 'white', fontSize:'0.9rem', marginBottom:'15px'}}>🕒 {course.schedule}</p>
                    <p style={styles.description}>{course.description}</p>

                    {/* LOGICA BOTTONI INTELLIGENTE */}
                    {userRole === 'Coach' ? (
                        <div style={styles.actions}>
                            <button onClick={() => { setFormData(course); setIsModalOpen(true); }} style={styles.btnEdit}>MODIFICA</button>
                            <button onClick={() => handleDelete(course.id)} style={styles.btnDelete}>ELIMINA</button>
                        </div>
                    ) : (
                        <button onClick={() => handleJoin(course.id)} style={styles.btnJoin}>
                            ISCRIVITI ORA ⚡
                        </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODALE COACH (Semplificata) */}
      {isModalOpen && userRole === 'Coach' && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{color:'white', marginTop:0}}>Gestisci Corso</h2>
            <form onSubmit={handleSave}>
               <input style={styles.input} placeholder="Nome Corso" value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} required />
               <input style={styles.input} placeholder="Coach" value={formData.instructor || ''} onChange={e=>setFormData({...formData, instructor: e.target.value})} required />
               <input style={styles.input} placeholder="Orari" value={formData.schedule || ''} onChange={e=>setFormData({...formData, schedule: e.target.value})} required />
               <input type="number" style={styles.input} placeholder="Prezzo" value={formData.priceMonthly || ''} onChange={e=>setFormData({...formData, priceMonthly: parseFloat(e.target.value)})} required />
               <textarea style={{...styles.input, minHeight:'100px'}} placeholder="Descrizione" value={formData.description || ''} onChange={e=>setFormData({...formData, description: e.target.value})} />
               <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                   <button type="button" onClick={()=>setIsModalOpen(false)} style={{padding:'10px', background:'transparent', border:'1px solid #333', color:'#aaa', cursor:'pointer'}}>Annulla</button>
                   <button type="submit" style={styles.btnGold}>Salva</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;