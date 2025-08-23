
import './Login.css'

function Login() {

  // Retrieve context from App.jsx
  

  // When the button is clicked, the username and password are sent to the backend for verification.
  function loginUser(event) {
    event.preventDefault();

  }

  return (
    <form className="login-form">
      <h1 className="login-h1">Login</h1>
      <input className="login-input" type="text" placeholder="Username" />
      <input className="login-input" type="password" placeholder="Password" />
      <button className="login-button" type="submit">Submit</button>
    </form>
  )
}

export default Login