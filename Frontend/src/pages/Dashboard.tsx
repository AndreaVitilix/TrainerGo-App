import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Tipi di dati
interface Course {
  id: string;
  name: string;
  instructor: string;
  priceMonthly: number;
  schedule: string;
  description: string;
  coachId: string;
}

interface Student {
  enrollmentId: string;
  fullName: string;
  email: string;
}

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollmentIds, setMyEnrollmentIds] = useState<string[]>([]); // Lista ID corsi a cui sono iscritto
  const [isLoading, setIsLoading] = useState(true);
  
  // STATI MODALI
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false); // Modale Crea/Modifica Corso
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false); // Modale Gestisci Utenti
  
  // DATI MODALI
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');

  const userRole = localStorage.getItem('userRole'); 

  // Form (Per Coach: Crea Corso)
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '', instructor: '', priceMonthly: 50, schedule: '', description: ''
  });

  // --- CARICAMENTO DATI ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Carica Corsi
      const resCourses = await api.get('/Courses');
      setCourses(resCourses.data);

      // 2. Se sono un User, carico le mie iscrizioni per sapere lo stato dei bottoni
      if (userRole === 'User') {
        const resEnroll = await api.get('/Enrollments/my-enrollments');
        // Salviamo solo gli ID dei corsi a cui siamo iscritti
        const ids = resEnroll.data.map((e: any) => e.courseId);
        setMyEnrollmentIds(ids);
      }
    } catch (error) {
      console.error("Errore fetch", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGICA USER (Atleta) ---
  const handleJoin = async (courseId: string) => {
    try {
        await api.post(`/Enrollments/join/${courseId}`);
        alert("🎉 Iscritto!");
        fetchData(); // Ricarica per aggiornare i bottoni
    } catch (error: any) { alert(error.response?.data?.message || "Errore"); }
  };

  const handleLeave = async (courseId: string) => {
    if(!confirm("Vuoi davvero disiscriverti?")) return;
    try {
        await api.delete(`/Enrollments/leave/${courseId}`);
        alert("Disiscrizione effettuata.");
        fetchData(); // Ricarica
    } catch (error: any) { alert("Errore disiscrizione"); }
  };

  // --- LOGICA COACH: GESTIONE STUDENTI ---
  const openStudentsModal = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsStudentsModalOpen(true);
    setStudentsList([]); // Pulisci lista vecchia
    try {
        const res = await api.get(`/Enrollments/course/${courseId}/students`);
        setStudentsList(res.data);
    } catch (error) { alert("Errore caricamento studenti"); }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedCourseId) return;
    try {
        await api.post(`/Enrollments/course/${selectedCourseId}/enroll-student`, { email: newStudentEmail });
        alert("Utente aggiunto!");
        setNewStudentEmail('');
        // Ricarica la lista studenti
        const res = await api.get(`/Enrollments/course/${selectedCourseId}/students`);
        setStudentsList(res.data);
    } catch (error: any) { alert(error.response?.data || "Errore aggiunta utente"); }
  };

  // --- LOGICA COACH: CRUD CORSI ---
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) await api.put('/Courses', formData);
      else await api.post('/Courses', formData);
      setIsCourseModalOpen(false);
      fetchData();
    } catch (error) { alert("Errore salvataggio."); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Eliminare il corso?")) return;
    try {
      await api.delete(`/Courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) { alert("Errore eliminazione."); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // --- STILI & TEMA ---
  const theme = { bg: '#09090b', cardBg: '#18181b', textMain: '#fafafa', textMuted: '#a1a1aa', accent: '#fbbf24', border: '#27272a', danger: '#ef4444' };
  const styles = {
    page: { minHeight: '100vh', backgroundColor: theme.bg, color: theme.textMain, fontFamily: "'Inter', sans-serif" },
    header: { background: 'rgba(24, 24, 27, 0.9)', borderBottom: `1px solid ${theme.border}`, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 10 },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
    card: { backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, padding: '20px' },
    
    // Bottoni
    btnGold: { backgroundColor: theme.accent, color: 'black', padding: '10px 20px', borderRadius: '4px', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' as const },
    btnJoin: { width: '100%', backgroundColor: theme.accent, color: 'black', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '15px' },
    btnLeave: { width: '100%', backgroundColor: 'transparent', color: theme.danger, border: `1px solid ${theme.danger}`, padding: '12px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', marginTop: '15px' },
    
    // Modale
    modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContent: { background: '#18181b', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', border: `1px solid ${theme.border}` },
    input: { width: '100%', padding: '12px', backgroundColor: '#09090b', border: `1px solid ${theme.border}`, borderRadius: '6px', color: 'white', marginBottom: '15px' }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{fontSize: '1.25rem', fontWeight: 800, color: theme.accent}}>TRAINER<span style={{color: 'white'}}>GO</span></div>
        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
            {userRole === 'User' && <button onClick={() => navigate('/miei-allenamenti')} style={{background: 'none', border:'none', color: theme.accent, cursor:'pointer', fontWeight:600}}>I MIEI CORSI</button>}
            <button onClick={handleLogout} style={{background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>LOGOUT</button>
        </div>
      </header>

      <main style={styles.container}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'end', marginBottom:'40px'}}>
            <div>
                <h1 style={{margin:0, fontSize:'2rem'}}>Gestione Corsi</h1>
                <p style={{color: theme.textMuted}}>Logged as: {userRole}</p>
            </div>
            {userRole === 'Coach' && <button onClick={() => { setFormData({}); setIsCourseModalOpen(true); }} style={styles.btnGold}>+ Crea Corso</button>}
        </div>

        {isLoading ? <p>Caricamento...</p> : (
          <div style={styles.grid}>
            {courses.map((course) => {
                const isEnrolled = myEnrollmentIds.includes(course.id);
                return (
                  <div key={course.id} style={styles.card}>
                    <h3 style={{margin:'0 0 10px 0', color:'white'}}>{course.name}</h3>
                    <p style={{color: theme.accent, fontSize:'0.9rem', fontWeight:600}}>Coach: {course.instructor}</p>
                    <p style={{color: theme.textMuted}}>{course.description}</p>
                    
                    {userRole === 'Coach' ? (
                        <div style={{display:'grid', gap:'10px', marginTop:'auto'}}>
                            <button onClick={() => openStudentsModal(course.id)} style={{...styles.btnGold, width:'100%', background:'#333', color:'white'}}>👥 Gestisci Iscritti</button>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                <button onClick={() => { setFormData(course); setIsCourseModalOpen(true); }} style={{padding:'10px', cursor:'pointer'}}>Modifica</button>
                                <button onClick={() => handleDeleteCourse(course.id)} style={{padding:'10px', cursor:'pointer', color: theme.danger}}>Elimina</button>
                            </div>
                        </div>
                    ) : (
                        isEnrolled 
                        ? <button onClick={() => handleLeave(course.id)} style={styles.btnLeave}>DISISCRIVITI</button>
                        : <button onClick={() => handleJoin(course.id)} style={styles.btnJoin}>ISCRIVITI ORA</button>
                    )}
                  </div>
                );
            })}
          </div>
        )}
      </main>

    {/* --- MODALE 1: GESTIONE CORSO (Solo Coach) --- */}
      {isCourseModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Gestisci Corso</h2>
            <form onSubmit={handleSaveCourse}>
               <input 
                  style={styles.input} 
                  placeholder="Nome Corso" 
                  value={formData.name || ''} 
                  onChange={e=>setFormData({...formData, name: e.target.value})} 
                  required 
               />
               <input 
                  style={styles.input} 
                  placeholder="Coach / Istruttore" 
                  value={formData.instructor || ''} 
                  onChange={e=>setFormData({...formData, instructor: e.target.value})} 
                  required 
               />
               <input 
                  style={styles.input} 
                  placeholder="Orari (es. Lun-Mer 18:00)" 
                  value={formData.schedule || ''} 
                  onChange={e=>setFormData({...formData, schedule: e.target.value})} 
                  required 
               />
               <input 
                  type="number" 
                  style={styles.input} 
                  placeholder="Prezzo Mensile (€)" 
                  value={formData.priceMonthly || ''} 
                  onChange={e=>setFormData({...formData, priceMonthly: parseFloat(e.target.value)})} 
                  required 
               />
               
               {/* --- ECCO IL PEZZO CHE MANCAVA! --- */}
               <textarea 
                  style={{...styles.input, minHeight: '100px', fontFamily: 'inherit'}} 
                  placeholder="Descrizione del corso..." 
                  value={formData.description || ''} 
                  onChange={e=>setFormData({...formData, description: e.target.value})} 
               />
               {/* ---------------------------------- */}

               <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                   <button type="button" onClick={()=>setIsCourseModalOpen(false)} style={{padding:'10px', cursor:'pointer'}}>Chiudi</button>
                   <button type="submit" style={styles.btnGold}>Salva</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE 2: GESTIONE ISCRITTI (Solo Coach) --- */}
      {isStudentsModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{marginTop:0}}>Iscritti al corso</h2>
            
            {/* Lista Iscritti */}
            <div style={{maxHeight:'200px', overflowY:'auto', marginBottom:'20px', border:`1px solid ${theme.border}`, padding:'10px', borderRadius:'6px'}}>
                {studentsList.length === 0 ? <p style={{color: theme.textMuted}}>Nessun iscritto.</p> : (
                    <ul style={{listStyle:'none', padding:0, margin:0}}>
                        {studentsList.map(s => (
                            <li key={s.enrollmentId} style={{padding:'10px', borderBottom:`1px solid ${theme.border}`}}>
                                <strong>{s.fullName}</strong><br/>
                                <small style={{color: theme.textMuted}}>{s.email}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Aggiungi Nuovo */}
            <h4 style={{marginBottom:'10px'}}>Aggiungi Atleta</h4>
            <form onSubmit={handleAddStudent} style={{display:'flex', gap:'10px'}}>
                <input style={{...styles.input, marginBottom:0}} placeholder="Email atleta..." value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} />
                <button type="submit" style={styles.btnGold}>+</button>
            </form>

            <button onClick={()=>setIsStudentsModalOpen(false)} style={{marginTop:'20px', width:'100%', padding:'10px', cursor:'pointer'}}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;