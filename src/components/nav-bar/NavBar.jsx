import './NavBar.css';
import { useAuth } from '../../context/AuthContext.jsx';

function NavBar() {
  const { isLoggedIn, logout } = useAuth();

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