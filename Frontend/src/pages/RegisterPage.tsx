import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  // STATO: Chi si sta registrando? 'user' (Atleta) o 'coach' (Trainer)
  const [roleMode, setRoleMode] = useState<'user' | 'coach'>('user');
  
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    codiceFiscale: '',
    telefono: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // LOGICA DI INVIO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // DECISIONE DINAMICA DELL'ENDPOINT
      const endpoint = roleMode === 'coach' 
        ? '/Auth/register/coach' 
        : '/Auth/register/user';

      // Chiamata al Backend
      await api.post(endpoint, formData);
      
      alert(`Registrazione ${roleMode === 'coach' ? 'Coach' : 'Atleta'} completata! Ora puoi accedere.`);
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Errore durante la registrazione. Controlla i dati.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- TEMA DARK & GOLD ---
  const theme = {
    bg: '#09090b',
    cardBg: '#18181b',
    gold: '#fbbf24',
    goldDim: 'rgba(251, 191, 36, 0.1)',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    border: '#27272a'
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg,
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    },
    card: {
      width: '100%',
      maxWidth: '500px',
      backgroundColor: theme.cardBg,
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      padding: '40px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    header: { textAlign: 'center' as const, marginBottom: '30px' },
    brand: { fontSize: '1.5rem', fontWeight: 900, color: theme.gold, letterSpacing: '2px', textTransform: 'uppercase' as const },
    subBrand: { color: 'white' },
    
    // TAB SELECTOR (User vs Coach)
    tabContainer: {
        display: 'flex',
        background: '#09090b',
        padding: '5px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: `1px solid ${theme.border}`
    },
    tab: (isActive: boolean) => ({
        flex: 1,
        padding: '12px',
        textAlign: 'center' as const,
        cursor: 'pointer',
        borderRadius: '6px',
        fontWeight: 700,
        fontSize: '0.9rem',
        transition: 'all 0.3s ease',
        backgroundColor: isActive ? theme.gold : 'transparent',
        color: isActive ? 'black' : theme.textMuted,
        textTransform: 'uppercase' as const
    }),

    // Form
    inputGroup: { marginBottom: '20px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    label: { display: 'block', color: theme.textMuted, fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' as const },
    input: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#09090b',
      border: `1px solid ${theme.border}`,
      borderRadius: '6px',
      color: 'white',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box' as const
    },
    button: {
      width: '100%',
      padding: '16px',
      backgroundColor: theme.gold,
      color: 'black',
      border: 'none',
      borderRadius: '6px',
      fontWeight: 800,
      fontSize: '1rem',
      cursor: 'pointer',
      textTransform: 'uppercase' as const,
      marginTop: '10px',
      boxShadow: `0 0 20px ${theme.goldDim}`
    },
    footer: { marginTop: '25px', textAlign: 'center' as const, fontSize: '0.9rem', color: theme.textMuted },
    link: { color: theme.gold, textDecoration: 'none', fontWeight: 600 },
    error: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.brand}>Trainer<span style={styles.subBrand}>Go</span></div>
          <p style={{color: theme.textMuted, marginTop:'5px'}}>Crea il tuo account</p>
        </div>

        {/* SELETTORE RUOLO */}
        <div style={styles.tabContainer}>
            <div 
                style={styles.tab(roleMode === 'user')} 
                onClick={() => setRoleMode('user')}
            >
                🏃‍♂️ Atleta
            </div>
            <div 
                style={styles.tab(roleMode === 'coach')} 
                onClick={() => setRoleMode('coach')}
            >
                ⚡ Coach Pro
            </div>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div style={styles.row}>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Nome</label>
                <input style={styles.input} required 
                    value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Cognome</label>
                <input style={styles.input} required 
                    value={formData.cognome} onChange={(e) => setFormData({...formData, cognome: e.target.value})} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" style={styles.input} required 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" style={styles.input} required 
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <div style={styles.row}>
             <div style={styles.inputGroup}>
                <label style={styles.label}>Codice Fiscale</label>
                <input style={styles.input} required 
                    value={formData.codiceFiscale} onChange={(e) => setFormData({...formData, codiceFiscale: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Telefono</label>
                <input style={styles.input} required 
                    value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Attendi...' : roleMode === 'coach' ? 'DIVENTA UN COACH' : 'REGISTRATI ORA'}
          </button>

        </form>

        <div style={styles.footer}>
          Hai già un account? <Link to="/login" style={styles.link}>ACCEDI QUI</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;