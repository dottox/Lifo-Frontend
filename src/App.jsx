
import NavBar from './components/nav-bar/NavBar.jsx'
import Login from './components/login/Login.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <NavBar />
      {isLoggedIn ? <p>Welcome back, adventurer!</p> : <Login />}
    </>
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