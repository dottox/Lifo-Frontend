
import NavBar from './components/nav-bar/NavBar.jsx'
import Login from './components/login/Login.jsx';
import Trabajo from './components/trabajo/Trabajo.jsx';
import { AuthProvider } from './context/AuthContextMock.jsx'; // Use mock for testing
import { useAuth } from './hooks/useAuth.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function AppContent() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

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