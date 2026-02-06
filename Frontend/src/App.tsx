import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';        // File: Login.tsx
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/Dashboard';    // File: Dashboard.tsx
import CoachAthletes from './pages/CoachAthletes';
import AthleteDetail from './pages/AthleteDetail';
import MyProfile from './pages/MyProfile';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/corsi" element={<CoursesPage />} />
      
      {/* Area Coach */}
      <Route path="/atleti" element={<CoachAthletes />} />
      <Route path="/atleta/:id" element={<AthleteDetail />} />
      
      {/* Area Atleta (User) */}
      <Route path="/mio-profilo" element={<MyProfile />} />
      {/* Ho aggiunto questa rotta per risolvere l'errore 'No routes matched' */}
      <Route path="/miei-allenamenti" element={<MyProfile />} /> 

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;