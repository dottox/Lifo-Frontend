import './NavBar.css';
import { useAuth } from '../../context/AuthContext.jsx';

function NavBar() {
  const { isLoggedIn, logout, authenticatedFetch, LIFO_API_URL } = useAuth();

  // Example of how to use authenticatedFetch for API calls that require auth
  // This function demonstrates the pattern for other components
  const _exampleApiCall = async () => {
    try {
      const response = await authenticatedFetch(`${LIFO_API_URL}/api/some-protected-endpoint`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API data:', data);
      } else {
        console.error('API call failed');
      }
      // Note: If response is 401, authenticatedFetch automatically handles logout
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <nav className="nav-bar">
      <ul className="nav-bar-list">
        <li><a href='/trabajo'>Trabajo</a></li>
        <li><a href='/inventario'>Inventario</a></li>
        <li><a href='/combate'>Combate</a></li>
        {isLoggedIn && (
          <li>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar