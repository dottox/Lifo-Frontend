
import NavBar from './components/nav-bar/NavBar.jsx'
import Login from './components/login/Login.jsx';
import { useContext, useState } from 'react';

function App() {
  const lifo_api_url = "https://lifo-api-fd466ebf5a8b.herokuapp.com";

  const [isLoggedIn, setIsLoggedIn] = useContext(false);

  return (
    <>
      <NavBar />
      {isLoggedIn ? <p>Welcome back, adventurer!</p> : <Login />}
    </>
  )
}

export default App