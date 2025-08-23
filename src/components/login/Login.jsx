
import './Login.css'
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  // When the button is clicked, the username and password are sent to the backend for verification.
  async function loginUser(event) {
    event.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setIsLoading(false);
  }

  return (
    <form className="login-form" onSubmit={loginUser}>
      <h1 className="login-h1">Login</h1>
      {error && <p style={{ color: 'red', margin: '10px 0' }}>{error}</p>}
      <input 
        className="login-input" 
        type="text" 
        placeholder="Username" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
      />
      <input 
        className="login-input" 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      <button 
        className="login-button" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Submit'}
      </button>
    </form>
  )
}

export default Login