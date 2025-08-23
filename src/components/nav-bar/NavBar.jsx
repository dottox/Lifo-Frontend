import './NavBar.css';

function NavBar() {
  return (
    <nav className="nav-bar">
      <ul className="nav-bar-list">
        <li><a href='/trabajo'>Trabajo</a></li>
        <li><a href='/inventario'>Inventario</a></li>
        <li><a href='/combate'>Combate</a></li>
      </ul>
    </nav>
  );
}


export default NavBar