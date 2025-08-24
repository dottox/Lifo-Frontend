
import NavBar from './components/nav-bar/NavBar.jsx'
import Login from './components/login/Login.jsx';
import Trabajo from './components/trabajo/Trabajo.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function AppContent() {
  const { isLoggedIn, isLoading, checkAuthStatus } = useAuth();

  // Call the AuthContext checkAuthStatus method to verify if the user is logged in
  useEffect(() => {
    checkAuthStatus()
  }, []);
  

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={
          isLoggedIn ? <p>Welcome back, adventurer!</p> : <Login />
        } />
        <Route path="/trabajo" element={
          isLoggedIn ? <Trabajo /> : <Navigate to="/" replace />
        } />
        <Route path="/inventario" element={
          isLoggedIn ? <p>Inventario page (not implemented)</p> : <Navigate to="/" replace />
        } />
        <Route path="/combate" element={
          isLoggedIn ? <p>Combate page (not implemented)</p> : <Navigate to="/" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App