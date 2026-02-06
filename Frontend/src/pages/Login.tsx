import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/Auth/login', { email, password });
      
      // 1. SALVA IL TOKEN
      localStorage.setItem('token', response.data.token || response.data.Token);
      
      // 2. SALVA IL RUOLO (FONDAMENTALE!!!)
      // Controlliamo se arriva come 'role' o 'Role' per sicurezza
      const roleFromServer = response.data.role || response.data.Role || 'User';
      localStorage.setItem('userRole', roleFromServer);

      setTimeout(() => navigate('/corsi'), 500);
    } catch (err: any) {
      console.error(err);
      setError('Credenziali non valide. Riprova.');
      setIsLoading(false);
    }
  };

  // --- TEMA DARK & GOLD ---
  const theme = {
    bg: '#09090b', cardBg: '#18181b', gold: '#fbbf24', goldDim: 'rgba(251, 191, 36, 0.1)',
    text: '#fafafa', textMuted: '#a1a1aa', border: '#27272a', danger: 'rgba(239, 68, 68, 0.1)', dangerText: '#ef4444'
  };

  const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, fontFamily: "'Inter', sans-serif", padding: '20px' },
    card: { width: '100%', maxWidth: '450px', backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center' as const },
    brand: { fontSize: '1.8rem', fontWeight: 900, color: theme.gold, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '10px', display: 'block' },
    subBrand: { color: 'white' },
    title: { color: 'white', fontSize: '1.5rem', fontWeight: 600, margin: '0 0 10px 0' },
    subtitle: { color: theme.textMuted, fontSize: '0.95rem', margin: '0 0 30px 0' },
    inputGroup: { marginBottom: '20px', textAlign: 'left' as const },
    label: { display: 'block', color: theme.textMuted, fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' as const },
    input: { width: '100%', padding: '14px', backgroundColor: '#09090b', border: `1px solid ${theme.border}`, borderRadius: '6px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
    button: { width: '100%', padding: '16px', backgroundColor: theme.gold, color: 'black', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', textTransform: 'uppercase' as const, marginTop: '10px', boxShadow: `0 0 20px ${theme.goldDim}` },
    footer: { marginTop: '30px', fontSize: '0.9rem', color: theme.textMuted },
    link: { color: theme.gold, textDecoration: 'none', fontWeight: 600 },
    error: { backgroundColor: theme.danger, color: theme.dangerText, padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: `1px solid ${theme.dangerText}30`, textAlign: 'left' as const }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brand}>Trainer<span style={styles.subBrand}>Go</span></div>
        <h2 style={styles.title}>Bentornato</h2>
        <p style={styles.subtitle}>Accedi alla tua dashboard professionale</p>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" style={styles.input} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@esempio.com" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" style={styles.input} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'ACCESSO IN CORSO...' : 'ACCEDI ORA'}
          </button>
        </form>

        <div style={styles.footer}>
          Non hai un account? <Link to="/register" style={styles.link}>CREALO QUI</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;