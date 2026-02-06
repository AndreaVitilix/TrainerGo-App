// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/RegisterPage'; // <--- Importa
import CoursesPage from './pages/Dashboard';
import MyTrainings from './pages/MyTrainings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> {/* <--- Aggiungi */}
      <Route path="/corsi" element={<CoursesPage />} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/miei-allenamenti" element={<MyTrainings />} />
    </Routes>
  );
}

export default App;