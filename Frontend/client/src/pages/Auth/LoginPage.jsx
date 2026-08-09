import "./LoginPage.css"
import {
    Dumbbell,
    Mail,
    Lock,
}from "lucide-react";
import { Link } from "react-router-dom";
function LoginPage() {
  
    return (
    <main className = "login-page">
        <div className="page-inner">
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
                <div className="user-input-area">
                <div className= "email-section">
                    <p className="email-text">
                        Email
                    </p>
                    
                        
                    <input className="user-email"
                    type="email"
                    placeholder="Enter your email"
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
                  >
                    
                  </input>
                   
                </div>
                <div className="login-button-area">
                    <button className="login-button" 
                    type = "submit"
                    
                    >
                        Log In
                    </button>
                 </div> 
                 <div className= "signup-section">
                    <p className="no-account">
                        Don't have an account?
                    </p>
                    <Link to="/signup" className="gotosignup">
                        Sign Up
                    </Link>
                    </div>  
                </div>
            </article>
        </div>
    </main>
  );
}

export default LoginPage;
