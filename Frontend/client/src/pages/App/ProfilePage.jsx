import "./ProfilePage.css";
import {
  UserRound,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function ProfilePage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [created, setCreated] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

  useEffect(() =>{
      async function getUserInfo(){
      try{  
        setLoading(true);
        setError("");
        const token = localStorage.getItem("repforgeToken");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/info`, { // gets all the info as a text first 
          headers: {
            "Content-Type":"application/json", // " " is needed cause of the hyphen
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json(); // convert from JSON text to a javascript object

        if (!response.ok){
          setError(data.message || "Could not load profile info.");
          return;
        }

        setEmail(data.email);
        setUsername(data.username);
        setCreated(data.created);
      }
      catch(error){
        console.log(error);
        setError("Could not connect to backend.");
      } finally {
        setLoading(false);
      }
    }

      getUserInfo();
    }, []);
  function formatWorkoutDate(created){
    if(!created){
      return "no date info"
      
    }
    const dateOnly = created.split("T")[0]; // first, remove everything after T in this type of date: 2026-08-09T05:31:54.005Z
    const [year, month, day] = dateOnly.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    )
    return date.toLocaleDateString("en-US", {
      month: "long",   
      day: "numeric",
      year: "numeric",
    })
  }
  function handleLogout(){
    localStorage.removeItem("repforgeToken");
    navigate("/login");
  }
  return (
    <main className="profile-page">
      <div className="profile-page-inner">
        <section className="profile-top-message">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-submessage">Manage your account and preferences.</p>
        </section>

        <section className="profile-overview-card">
          <div className="profile-avatar">
            <UserRound size={74} />
          </div>

          <div className="profile-overview-text">
            {loading && <p className="profile-status">Loading profile...</p>}
            {!loading && error && <p className="profile-error">{error}</p>}
            {!loading && !error && (
              <>
                <h3>{username}</h3>
                <p>{email}</p>
                <p>Member since {formatWorkoutDate(created)}</p>
              </>
            )}
          </div>
        </section>

        

        <section className="profile-logout-card">
          <h2 className="logout-header">Log Out</h2>

          <div className="profile-logout-row">
            <div className="profile-logout-left">
              <span className="profile-setting-icon">
                <LogOut size={26} />
              </span>

              <span className="profile-setting-text">
                <p>You'll need to log in again to access your account.</p>
              </span>
            </div>

            <button className="profile-logout-button" type="button" onClick={handleLogout}>Log Out</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProfilePage;
