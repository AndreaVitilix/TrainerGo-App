import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// --- INTERFACCE DATI ---
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
  const [myEnrollmentIds, setMyEnrollmentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATI MODALI
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  
  // DATI MODALI
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');

  const userRole = localStorage.getItem('userRole'); 

  // Form Stato
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '', instructor: '', priceMonthly: 50, schedule: '', description: ''
  });

  // --- 1. CARICAMENTO DATI ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resCourses = await api.get('/Courses');
      setCourses(resCourses.data);

      if (userRole === 'User') {
        const resEnroll = await api.get('/Enrollments/my-enrollments');
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

  // --- 2. LOGICA ATLETA (Iscrizione) ---
  const handleJoin = async (courseId: string) => {
    try {
        await api.post(`/Enrollments/join/${courseId}`);
        alert("🎉 Iscrizione completata!");
        fetchData();
    } catch (error: any) { alert(error.response?.data?.message || "Errore iscrizione"); }
  };

  const handleLeave = async (courseId: string) => {
    if(!confirm("Vuoi davvero disiscriverti da questo corso?")) return;
    try {
        await api.delete(`/Enrollments/leave/${courseId}`);
        alert("Disiscrizione effettuata.");
        fetchData();
    } catch (error: any) { alert("Errore disiscrizione"); }
  };

  // --- 3. LOGICA COACH: GESTIONE ISCRITTI ---
  const openStudentsModal = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsStudentsModalOpen(true);
    setStudentsList([]); 
    try {
        const res = await api.get(`/Enrollments/course/${courseId}/students`);
        setStudentsList(res.data);
    } catch (error) { console.error("Errore caricamento studenti"); }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedCourseId || !newStudentEmail) return;
    try {
        await api.post(`/Enrollments/course/${selectedCourseId}/enroll-student`, { email: newStudentEmail });
        setNewStudentEmail('');
        const res = await api.get(`/Enrollments/course/${selectedCourseId}/students`);
        setStudentsList(res.data);
    } catch (error: any) { alert(error.response?.data || "Email non trovata o già iscritta"); }
  };

  // --- 4. LOGICA COACH: CRUD CORSI (CORRETTA PER AGGIORNAMENTO) ---
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Creiamo un oggetto pulito senza eventuali campi nidificati del DB
      const cleanData = {
        id: formData.id,
        name: formData.name,
        instructor: formData.instructor,
        priceMonthly: formData.priceMonthly,
        schedule: formData.schedule,
        description: formData.description
      };

      if (formData.id) {
        // AGGIORNAMENTO (PUT)
        await api.put(`/Courses/${formData.id}`, cleanData);
        alert("Corso aggiornato con successo! ✅");
      } else {
        // CREAZIONE (POST)
        await api.post('/Courses', cleanData);
        alert("Nuovo corso creato! 🚀");
      }
      
      setIsCourseModalOpen(false);
      fetchData();
    } catch (error: any) { 
        console.error("Errore salvataggio:", error.response?.data);
        alert("Errore durante il salvataggio del corso."); 
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare definitivamente questo corso?")) return;
    try {
      await api.delete(`/Courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) { alert("Errore durante l'eliminazione."); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // --- 5. STILI ---
  const theme = { bg: '#09090b', cardBg: '#18181b', textMain: '#fafafa', textMuted: '#a1a1aa', accent: '#fbbf24', border: '#27272a', danger: '#ef4444' };
  const styles = {
    page: { minHeight: '100vh', backgroundColor: theme.bg, color: theme.textMain, fontFamily: "'Inter', sans-serif" },
    header: { background: 'rgba(24, 24, 27, 0.95)', borderBottom: `1px solid ${theme.border}`, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 10, backdropFilter: 'blur(10px)' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' },
    card: { backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, padding: '24px', position: 'relative' as const },
    btnGold: { backgroundColor: theme.accent, color: 'black', padding: '12px 20px', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' as const, fontSize: '0.85rem' },
    btnOutline: { backgroundColor: 'transparent', color: 'white', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontWeight: 600, cursor: 'pointer', flex: 1, textAlign: 'center' as const },
    btnDanger: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: theme.danger, padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 700, cursor: 'pointer', flex: 1 },
    modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContent: { background: '#18181b', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '500px', border: `1px solid ${theme.border}` },
    input: { width: '100%', padding: '14px', backgroundColor: '#09090b', border: `1px solid ${theme.border}`, borderRadius: '8px', color: 'white', marginBottom: '15px', outline: 'none' }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{fontSize: '1.25rem', fontWeight: 800, color: theme.accent}}>TRAINER<span style={{color: 'white'}}>GO</span></div>
        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
            {userRole === 'User' && <button onClick={() => navigate('/mio-profilo')} style={{background: 'none', border:'none', color: theme.accent, cursor:'pointer', fontWeight:600}}>IL MIO PROFILO</button>}
            <button onClick={handleLogout} style={{background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>LOGOUT</button>
        </div>
      </header>

      <main style={styles.container}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px'}}>
            <div>
                <h1 style={{margin:0, fontSize:'2rem'}}>Dashboard Corsi</h1>
                <p style={{color: theme.textMuted, marginTop: '5px'}}>Benvenuto, ruolo: <strong>{userRole}</strong></p>
            </div>
            <div style={{display:'flex', gap:'10px'}}>
                {userRole === 'Coach' && (
                  <>
                    <button onClick={() => navigate('/atleti')} style={{...styles.btnOutline, padding:'12px 20px'}}>📋 Gestisci Atleti</button>
                    <button onClick={() => { setFormData({name: '', instructor: '', priceMonthly: 50, schedule: '', description: ''}); setIsCourseModalOpen(true); }} style={styles.btnGold}>+ Crea Corso</button>
                  </>
                )}
            </div>
        </div>

        {isLoading ? <p>Caricamento in corso...</p> : (
          <div style={styles.grid}>
            {courses.map((course) => {
                const isEnrolled = myEnrollmentIds.includes(course.id);
                return (
                  <div key={course.id} style={styles.card}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'10px'}}>
                        <h3 style={{margin:0, fontSize:'1.2rem'}}>{course.name}</h3>
                        <span style={{background:'#27272a', padding:'4px 8px', borderRadius:'6px', fontSize:'0.85rem'}}>{course.priceMonthly}€</span>
                    </div>
                    <div style={{color: theme.accent, fontSize:'0.8rem', fontWeight: 700, marginBottom:'15px'}}>⚡ {course.instructor}</div>

                    <p style={{color: theme.textMuted, fontSize: '0.9rem', flex: 1, marginBottom:'20px'}}>
                        {course.description}
                        <br/><br/>
                        <span style={{color:'white'}}>🕒 {course.schedule}</span>
                    </p>
                    
                    {userRole === 'Coach' ? (
                        <div style={{display:'flex', flexDirection:'column', gap:'10px', borderTop:`1px solid ${theme.border}`, paddingTop:'20px'}}>
                            <button onClick={() => openStudentsModal(course.id)} style={styles.btnGold}>👥 Iscritti</button>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => { setFormData(course); setIsCourseModalOpen(true); }} style={styles.btnOutline}>✏️ Modifica</button>
                                <button onClick={() => handleDeleteCourse(course.id)} style={styles.btnDanger}>🗑️</button>
                            </div>
                        </div>
                    ) : (
                        isEnrolled 
                        ? <button onClick={() => handleLeave(course.id)} style={{...styles.btnOutline, color: theme.danger, borderColor: theme.danger, width:'100%'}}>DISISCRIVITI</button>
                        : <button onClick={() => handleJoin(course.id)} style={{...styles.btnGold, width:'100%'}}>ISCRIVITI ORA 🔥</button>
                    )}
                  </div>
                );
            })}
          </div>
        )}
      </main>

      {/* MODALE GESTIONE CORSO */}
      {isCourseModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{marginTop:0, color: theme.accent}}>{formData.id ? 'Modifica Corso' : 'Nuovo Corso'}</h2>
            <form onSubmit={handleSaveCourse}>
               <input style={styles.input} placeholder="Nome Corso" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
               <input style={styles.input} placeholder="Istruttore" value={formData.instructor} onChange={e=>setFormData({...formData, instructor: e.target.value})} required />
               <input style={styles.input} placeholder="Orari" value={formData.schedule} onChange={e=>setFormData({...formData, schedule: e.target.value})} required />
               <input type="number" style={styles.input} placeholder="Prezzo (€)" value={formData.priceMonthly} onChange={e=>setFormData({...formData, priceMonthly: parseFloat(e.target.value)})} required />
               <textarea style={{...styles.input, minHeight: '100px'}} placeholder="Descrizione..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
               <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                   <button type="button" onClick={()=>setIsCourseModalOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>Annulla</button>
                   <button type="submit" style={styles.btnGold}>Conferma</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE GESTIONE ISCRITTI */}
      {isStudentsModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{marginTop:0}}>Iscritti al corso</h2>
            <div style={{maxHeight:'250px', overflowY:'auto', marginBottom:'20px', border:`1px solid ${theme.border}`, borderRadius:'8px'}}>
                {studentsList.length === 0 ? <p style={{padding:'20px', color: theme.textMuted}}>Nessun iscritto.</p> : (
                  <ul style={{listStyle:'none', padding:0, margin:0}}>
                    {studentsList.map(s => (
                      <li key={s.enrollmentId} style={{padding:'15px', borderBottom:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-between'}}>
                        <div><strong>{s.fullName}</strong><br/><small style={{color: theme.textMuted}}>{s.email}</small></div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <h4 style={{marginBottom:'10px'}}>Iscrivi manualmente</h4>
            <form onSubmit={handleAddStudent} style={{display:'flex', gap:'10px'}}>
                <input style={{...styles.input, marginBottom:0}} placeholder="Email..." value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} />
                <button type="submit" style={styles.btnGold}>+</button>
            </form>
            <button onClick={()=>setIsStudentsModalOpen(false)} style={{marginTop:'25px', width:'100%', padding:'10px', background:'none', color: theme.textMuted, border:'none', cursor:'pointer'}}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;