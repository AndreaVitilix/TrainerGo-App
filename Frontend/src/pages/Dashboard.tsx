import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// --- DEFINIZIONE TIPI (INTERFACES) ---
// Definiamo la struttura dei dati che arrivano dal backend
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

  // --- STATI PER I DATI ---
  const [courses, setCourses] = useState<Course[]>([]); // Lista dei corsi
  const [myEnrollmentIds, setMyEnrollmentIds] = useState<string[]>([]); // ID dei corsi a cui l'atleta è iscritto
  const [totalAthletes, setTotalAthletes] = useState(0); // Numero totale atleti seguiti (per il Coach)
  const [isLoading, setIsLoading] = useState(true); // Stato di caricamento
  
  // --- STATI PER L'INTERFACCIA (MODALI) ---
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false); // Modale Crea/Modifica Corso
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false); // Modale Lista Iscritti
  
  // --- STATI PER LA GESTIONE ---
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // Recuperiamo il ruolo dell'utente dal localStorage
  const userRole = localStorage.getItem('userRole'); 

  // Stato per il Form del Corso (utilizzato sia per Creazione che per Modifica)
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '', instructor: '', priceMonthly: 50, schedule: '', description: ''
  });

  // --- 1. FUNZIONE CARICAMENTO DATI (FETCH) ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Carichiamo i corsi (Il coach vede i suoi, l'utente tutti)
      const resCourses = await api.get('/Courses');
      setCourses(resCourses.data);

      // Se l'utente è un COACH, recuperiamo il numero reale di atleti dalla lista "I Miei Atleti"
      if (userRole === 'Coach') {
        const resAthletes = await api.get('/Athletes/my-athletes');
        setTotalAthletes(resAthletes.data.length); // Impostiamo il contatore globale
      }

      // Se l'utente è un ATLETA, recuperiamo i corsi a cui è già iscritto
      if (userRole === 'User') {
        const resEnroll = await api.get('/Enrollments/my-enrollments');
        const ids = resEnroll.data.map((e: any) => e.courseId);
        setMyEnrollmentIds(ids);
      }
    } catch (error) {
      console.error("Errore durante il caricamento dei dati:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Eseguiamo il caricamento al montaggio del componente
  useEffect(() => { fetchData(); }, []);

  // --- 2. LOGICA ATLETA (ISCRIVITI/DISISCRIVITI) ---
  const handleJoin = async (courseId: string) => {
    try {
        await api.post(`/Enrollments/join/${courseId}`);
        alert("🎉 Iscrizione avvenuta con successo!");
        fetchData(); // Aggiorniamo la UI
    } catch (error: any) { alert("Errore durante l'iscrizione"); }
  };

  const handleLeave = async (courseId: string) => {
    if(!confirm("Vuoi davvero disiscriverti da questo corso?")) return;
    try {
        await api.delete(`/Enrollments/leave/${courseId}`);
        fetchData();
    } catch (error: any) { alert("Errore durante la disiscrizione"); }
  };

  // --- 3. LOGICA COACH: GESTIONE ISCRITTI ---
  const openStudentsModal = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsStudentsModalOpen(true);
    try {
        const res = await api.get(`/Enrollments/course/${courseId}/students`);
        setStudentsList(res.data);
    } catch (error) { console.error("Errore caricamento iscritti"); }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post(`/Enrollments/course/${selectedCourseId}/enroll-student`, { email: newStudentEmail });
        setNewStudentEmail('');
        fetchData(); // Aggiorniamo il contatore generale
        openStudentsModal(selectedCourseId!); // Aggiorniamo la lista nel modale
    } catch (error: any) { alert("Utente non trovato o già iscritto."); }
  };

  // --- 4. LOGICA COACH: SALVA/MODIFICA CORSO ---
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Creiamo un oggetto pulito da inviare al backend (risolve errori di aggiornamento)
      const cleanData = {
        name: formData.name,
        instructor: formData.instructor,
        priceMonthly: Number(formData.priceMonthly),
        schedule: formData.schedule,
        description: formData.description
      };

      if (formData.id) {
        // Se c'è un ID, stiamo MODIFICANDO
        await api.put(`/Courses/${formData.id}`, cleanData);
      } else {
        // Altrimenti stiamo CREANDO
        await api.post('/Courses', cleanData);
      }
      setIsCourseModalOpen(false);
      fetchData();
    } catch (error) { alert("Errore nel salvataggio del corso."); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Eliminare definitivamente il corso?")) return;
    try {
      await api.delete(`/Courses/${id}`);
      fetchData();
    } catch (error) { alert("Errore eliminazione"); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // --- 5. TEMA E STILI ---
  const theme = { bg: '#09090b', card: '#18181b', gold: '#fbbf24', text: '#fafafa', muted: '#a1a1aa', border: '#27272a', danger: '#ef4444', success: '#22c55e' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- HEADER --- */}
      <header style={{ background: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.border}`, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: theme.gold }}>
          TRAINER<span style={{ color: 'white' }}>GO</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
{userRole === 'User' && (
  <>
    <button onClick={() => navigate('/diario')} style={{ background: theme.gold, border: 'none', color: 'black', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, marginRight: '10px' }}>
      📓 IL MIO DIARIO
    </button>
    <button onClick={() => navigate('/mio-profilo')} style={{ background: 'none', border: `1px solid ${theme.border}`, color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
      PROFILO
    </button>
  </>
)}          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${theme.border}`, color: 'white', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>LOGOUT</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* --- HERO SECTION (Titolo + Statistiche Coach) --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>Dashboard</h1>
            <p style={{ color: theme.muted, marginTop: '5px' }}>Benvenuto! Ecco la panoramica delle tue attività.</p>
            
          </div>

          {/* BOX STATISTICHE (Visibile solo al Coach) */}
          {userRole === 'Coach' && (
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ background: '#1c1c1c', border: `1px solid ${theme.border}`, padding: '15px 25px', borderRadius: '15px', textAlign: 'right' }}>
                <div style={{ color: theme.muted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>Atleti Seguiti</div>
                <div style={{ color: theme.gold, fontSize: '1.8rem', fontWeight: 900 }}>{totalAthletes}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => navigate('/atleti')} style={{ padding: '10px 15px', borderRadius: '8px', border: `1px solid ${theme.border}`, color: 'white', background: '#27272a', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>📋 GESTISCI ATLETI</button>
                <button onClick={() => { setFormData({name:'', instructor:'', priceMonthly:50, schedule:'', description:''}); setIsCourseModalOpen(true); }} style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', background: theme.gold, color: 'black', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>+ NUOVO CORSO</button>
              </div>
            </div>
          )}
        </div>

        {/* --- GRID DEI CORSI --- */}
        {isLoading ? <p style={{color: theme.muted}}>Caricamento corsi...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' }}>
            {courses.map((course) => {
              const isEnrolled = myEnrollmentIds.includes(course.id);

              return (
                <div key={course.id} style={{ backgroundColor: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '28px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  
                  {/* Prezzo e Stato */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    {isEnrolled && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.success, background: `${theme.success}15`, padding: '4px 10px', borderRadius: '12px', border: `1px solid ${theme.success}30` }}>ISCRITTO</span>}
                    <span style={{ fontWeight: 800, fontSize: '1.3rem', marginLeft: 'auto' }}>{course.priceMonthly}€</span>
                  </div>

                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>{course.name}</h3>
                  <div style={{ color: theme.gold, fontSize: '0.8rem', fontWeight: 700, marginBottom: '20px' }}>⚡ {course.instructor.toUpperCase()}</div>

                  <p style={{ color: theme.muted, fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '25px', flex: 1 }}>{course.description}</p>
                  
                  {/* Orari */}
                  <div style={{ marginBottom: '25px', padding: '12px', background: '#09090b', borderRadius: '12px', fontSize: '0.85rem', border: `1px solid ${theme.border}` }}>
                    <span style={{ color: theme.muted }}>Orario:</span> {course.schedule}
                  </div>

                  {/* Pulsanti Azione (Dinamici per ruolo) */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {userRole === 'Coach' ? (
                      <>
                        <button onClick={() => openStudentsModal(course.id)} style={{ flex: 3, padding: '12px', borderRadius: '12px', border: 'none', background: 'white', color: 'black', fontWeight: 700, cursor: 'pointer' }}>Iscritti</button>
                        <button onClick={() => { setFormData(course); setIsCourseModalOpen(true); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: 'none', color: 'white', cursor: 'pointer' }}>✏️</button>
                        <button onClick={() => handleDeleteCourse(course.id)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: `${theme.danger}20`, color: theme.danger, cursor: 'pointer' }}>🗑️</button>
                      </>
                    ) : (
                      isEnrolled ? (
                        <button onClick={() => handleLeave(course.id)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${theme.danger}`, color: theme.danger, background: 'none', fontWeight: 700, cursor: 'pointer' }}>DISISCRIVITI</button>
                      ) : (
                        <button onClick={() => handleJoin(course.id)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: theme.gold, color: 'black', fontWeight: 800, cursor: 'pointer' }}>ISCRIVITI ORA 🔥</button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- MODALE GESTIONE CORSO (Crea/Modifica) --- */}
      {isCourseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: theme.card, padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px', border: `1px solid ${theme.border}` }}>
            <h2 style={{ marginTop: 0, color: theme.gold }}>{formData.id ? 'Modifica Corso' : 'Nuovo Corso'}</h2>
            <form onSubmit={handleSaveCourse}>
               <input style={{ width: '100%', padding: '12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: 'white', marginBottom: '15px' }} placeholder="Nome Corso" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
               <input style={{ width: '100%', padding: '12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: 'white', marginBottom: '15px' }} placeholder="Istruttore" value={formData.instructor} onChange={e=>setFormData({...formData, instructor: e.target.value})} required />
               <input type="number" style={{ width: '100%', padding: '12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: 'white', marginBottom: '15px' }} placeholder="Prezzo Mensile (€)" value={formData.priceMonthly} onChange={e=>setFormData({...formData, priceMonthly: parseFloat(e.target.value)})} required />
               <input style={{ width: '100%', padding: '12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: 'white', marginBottom: '15px' }} placeholder="Orari" value={formData.schedule} onChange={e=>setFormData({...formData, schedule: e.target.value})} required />
               <textarea style={{ width: '100%', padding: '12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: 'white', marginBottom: '20px', minHeight: '100px' }} placeholder="Descrizione..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
               <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                   <button type="button" onClick={()=>setIsCourseModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Annulla</button>
                   <button type="submit" style={{ padding: '10px 25px', borderRadius: '8px', border: 'none', background: theme.gold, color: 'black', fontWeight: 800, cursor: 'pointer' }}>CONFERMA</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE GESTIONE ATLETI ISCRITTI --- */}
      {isStudentsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: theme.card, padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px', border: `1px solid ${theme.border}` }}>
            <h2 style={{ marginTop: 0 }}>Atleti Iscritti</h2>
            <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', border: `1px solid ${theme.border}`, borderRadius: '10px' }}>
                {studentsList.length === 0 ? <p style={{ padding: '20px', color: theme.muted }}>Nessun iscritto.</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {studentsList.map(s => (
                      <li key={s.enrollmentId} style={{ padding: '15px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontWeight: 700 }}>{s.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: theme.muted }}>{s.email}</div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            {/* Form per iscrivere manualmente un atleta al corso */}
            <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px' }}>
                <input style={{ flex: 1, padding: '12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: 'white' }} placeholder="Iscrivi con Email..." value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} />
                <button type="submit" style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', background: theme.gold, color: 'black', fontWeight: 800 }}>+</button>
            </form>
            <button onClick={()=>setIsStudentsModalOpen(false)} style={{ marginTop: '25px', width: '100%', padding: '12px', background: 'none', border: `1px solid ${theme.border}`, color: 'white', borderRadius: '10px', cursor: 'pointer' }}>CHIUDI</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;