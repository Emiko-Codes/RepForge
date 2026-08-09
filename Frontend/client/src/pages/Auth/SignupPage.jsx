import "./SignupPage.css";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Dumbbell,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { useState } from "react";

function SignupPage() {
const [username, setUserName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const navigate = useNavigate();

 async function handleSignup(event){
  event.preventDefault();
  if (password !== confirmPassword) {
  setMessage("Passwords do not match.");
  return;
}
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, { //structure is fetch (where to send the request, how to send the request
    method: "POST",
    headers: {
      "Content-type" : "application/json"
    },
    body: JSON.stringify({
      username,
      email,
      password
    })  
  });
  const data = await response.json();

  if (!response.ok){
    setMessage(data.message || "Sign up failed")
    return;
  }

    localStorage.setItem("repforgeToken", data.token);

    navigate("/login");
 }

  return (
    <main className="signup-page">
      <div className="page-inner">
        <article className="signup-box">
          <div className="box-brand">
            <Dumbbell size={40} />
            <h2 className="signup-title">RepForge</h2>
          </div>

          <div className="box-header">
            <h1 className="create-text">Create Account</h1>
            <p className="create-text-sub">
              Sign up to start your fitness journey
            </p>
          </div>

          <form className="user-input-area" onSubmit={handleSignup}>
            <div className="name-section">
              <p className="name-text">Name</p>

              <div className="name-box">
                <User className="input-icon" size={22} />
                <input
                  className="user-name"
                  type="text"
                  placeholder="Enter your name"
                  value = {username}
                  onChange = {(event) => setUserName(event.target.value)}
                />
              </div>
            </div>

            <div className="email-section">
              <p className="email-text">Email</p>

              <div className="email-box">
                <Mail className="input-icon" size={22} />
                <input
                  className="user-email"
                  type="email"
                  placeholder="Enter your email"
                  value ={email}
                  onChange = {(event) => setEmail(event.target.value)}
                  
                />
              </div>
            </div>

            <div className="password-section">
              <p className="password-text">Password</p>

              <div className="password-box">
                <Lock className="input-icon" size={22} />
                <input
                  className="user-password"
                  type="password"
                  placeholder="Create a password"
                  onChange = {(event) => setPassword(event.target.value)}
                  value = {password}
                />
                
              </div>
            </div>

            <div className="confirm-password-section">
              <p className="confirm-password-text">Confirm Password</p>

              <div className="confirm-password-box">
                <Lock className="input-icon" size={22} />
                <input
                  className="user-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  onChange = {(event) => setConfirmPassword(event.target.value)}
                />
                
              </div>

            </div>
              {message && <p className="sign-up-message">{message}</p> //If there is an error/success message, display it. If not, display nothing.
              }   
            <button className="signup-button" type="submit">
              Sign Up
            </button>
          </form>

          <div className="login-section">
            <p className="already-account">Already have an account?</p>
            <Link to="/login" className="gotologin">
              Log in
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

export default SignupPage;
