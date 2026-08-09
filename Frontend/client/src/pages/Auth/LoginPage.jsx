import "./LoginPage.css"
import {
  Dumbbell,
  Mail,
  Lock,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";


function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault(); //prevents the 

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, { // structure is fetch (where to send the request, how to send the request
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Login failed");
      return;
    }

    localStorage.setItem("repforgeToken", data.token);

    navigate("/dashboard");
  }
	  
  return (
    <main className = "login-page">
      <div className="login-page-inner">
        <article className= "login-box">
          <div className="box-brand">
            <Dumbbell size = {40}/>
            <h2 className ="login-title">RepForge</h2>
          </div>

          <div className = "box-header">
            <h1 className="welcome-text"> 
              Welcome Back
            </h1>
            <p className = "welcome-text-sub">
              Log in to continue your fitness journey
            </p>
          </div>

          <form className="user-input-area" onSubmit ={handleLogin}>
            <div className= "email-section">
              <p className="email-text">
                Email
              </p>

              <input className="user-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)} //event.target is the input box that changed and event.target.value is the current text inside that input form
                //“Every time the user types in this input, take the current text inside the input and save it into the email state.”
              >
              </input>
            </div>

            <div className= "password-section">
              <p className="password-text">
                Password
              </p>

              <input className="user-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)} 
              >   
              </input>
            </div>

            {message && <p className="login-message">{message}</p> //If there is an error/success message, display it. If not, display nothing.
            } 

            <div className="login-button-area">
              <button className="login-button" 
                type = "submit"
              >
                Log In
              </button>
            </div> 
          </form>

          <div className= "signup-section">
            <p className="no-account">
              Don't have an account?
            </p>
            <Link to="/signup" className="gotosignup">
              Sign Up
            </Link>
          </div>  
        </article>
      </div>
    </main>
  );
}

export default LoginPage;
