import "./Dashboard.css";
import {
  Activity,
  Dumbbell,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Sparkles,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

  function formatWorkoutDate(workoutDate) {
  if (!workoutDate) {
    return "No date";
  }
  
 const dateOnly = workoutDate.split("T")[0];
 const [year, month, day] = dateOnly.split("-");
 const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardPage() {
  const [recenthistory, setRecentHistory] = useState([]);
  const [weeklyvolume, setWeeklyVolume] = useState("");
  const [weeklyWorkoutCount, setWeeklyWorkoutCount] = useState(0);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState("");
  const [weeklyVolumeLoading, setWeeklyVolumeLoading] = useState(true);
  const [weeklyVolumeError, setWeeklyVolumeError] = useState("");
  const [weeklyWorkoutCountLoading, setWeeklyWorkoutCountLoading] = useState(true);
  const [weeklyWorkoutCountError, setWeeklyWorkoutCountError] = useState("");
  
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiReply, setAiReply] = useState(
    "Hi! I'm your AI Coach. I can help you analyze your training, volume, and recovery."
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function getRecentHistory() {
      try {
        setRecentLoading(true);
        setRecentError("");
        const token = localStorage.getItem("repforgeToken");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/recent-workouts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) { 
          setRecentError(data.message || "Could not load recent workouts.");
          return;
        }

        setRecentHistory(data.recentWorkouts);
      } catch (error) {
        console.log(error);
        setRecentError("Could not connect to backend.");
      } finally {
        setRecentLoading(false);
      }
    }

    getRecentHistory();
  }, []); // Runs once when the dashboard first loads.
async function askRepForgeAi(questionText = aiQuestion) {
  if (!questionText.trim()) {
    return;
  }

  try {
    setAiLoading(true);
    setAiError("");

    const token = localStorage.getItem("repforgeToken");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/coach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question: questionText,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setAiError(data.message || "RepForge AI could not answer right now.");
      return;
    }

    setAiReply(data.reply);
    setAiQuestion("");
  } catch (error) {
    console.log(error);
    setAiError("Could not connect to RepForge AI.");
  } finally {
    setAiLoading(false);
  }
}
  useEffect(() =>{
    async function getWeeklyVolume(){
      try{
      setWeeklyVolumeLoading(true);
      setWeeklyVolumeError("");
      const token = localStorage.getItem("repforgeToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weekly-volume`, {
        headers: {
          Authorization: `Bearer ${token}`,
          }
        });
        const data = await response.json();

        if (!response.ok){
          setWeeklyVolumeError(data.message || "Could not get weekly volume.");
          return;
        }
        setWeeklyVolume(data.weeklyvolume);
      }
      catch(error){
        console.log(error);
        setWeeklyVolumeError("Could not connect to backend.");
      } finally {
        setWeeklyVolumeLoading(false);
      }
    }

    getWeeklyVolume();
  }, []);

  useEffect(() => {
    async function getWeeklyWorkoutCount() {
      try {
        setWeeklyWorkoutCountLoading(true);
        setWeeklyWorkoutCountError("");
        const token = localStorage.getItem("repforgeToken");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weekly-workout-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setWeeklyWorkoutCountError(data.message || "Could not load workout count.");
          return;
        }

        setWeeklyWorkoutCount(data.weeklyWorkoutCount);
      } catch (error) {
        console.log(error);
        setWeeklyWorkoutCountError("Could not connect to backend.");
      } finally {
        setWeeklyWorkoutCountLoading(false);
      }
    }

    getWeeklyWorkoutCount();
  }, []);

  return (
    <main className="dash-page">
      <div className="dashpage-inner">
        <section className = "dash-top-message">
        <h1 className = "dash-title">Dashboard</h1>
        <p className = "dashtop-message">Welcome back, Lift heavy!</p>
        </section>
        <div className="restof-page">
            <div className="stats-section">
            <section >
              <article className="this-week">
                <div className="this-week-left">
                  <p> This Week</p>
                  <span className="this-week-value">
                    {weeklyWorkoutCountLoading ? "..." : weeklyWorkoutCountError ? "--" : weeklyWorkoutCount}
                  </span>
                  {weeklyWorkoutCountError ? (
                    <p className="dashboard-error">{weeklyWorkoutCountError}</p>
                  ) : (
                    <p className="dash-sub-text"> Workouts</p>
                  )}
                  
                </div> 
                <div className = "this-week-right">
                  <Activity className="activity-icon" size={24} />
                </div> 
              </article>
            </section>
            <section>
              <article className="weekly-volume">
                <div className="weekly-volume-left">
                  <p>Weekly Volume</p>
                  <span className = "weekly-volume-value">
                    {weeklyVolumeLoading ? "..." : weeklyVolumeError ? "--" : Number(weeklyvolume || 0).toLocaleString()}
                  </span>
                  {weeklyVolumeError ? (
                    <p className="dashboard-error">{weeklyVolumeError}</p>
                  ) : (
                    <p className="dash-sub-text">lbs</p>
                  )}

                </div> 
                <div className = "weekly-volume-right">
                  <Dumbbell className="activity-icon-other" size={24} />
                </div> 
              </article>
            </section>
          </div>  
          <article className ="recent-workouts-area">
              <div className="recent-workouts-header">
                  <p className="recent-header">Recent Workouts</p>

                  <Link to="/history" className="view-history-link">
                    View all history <ArrowRight size={18} />
                  </Link>
                </div>

                <div className="recent-workouts-list">
                  {recentLoading && <p className="dashboard-status">Loading recent workouts...</p>}
                  {!recentLoading && recentError && <p className="dashboard-error">{recentError}</p>}
                  {!recentLoading && !recentError && recenthistory.length === 0 && (
                    <p className="dashboard-status">No recent workouts yet.</p>
                  )}
                  {!recentLoading && !recentError && recenthistory.map((workout) => (
                    <Link key={workout.id} to={`/history/${workout.id}`} className="recent-workout-row">
                      <CalendarDays size={22} />
                      <span>{workout.workout_day}</span>
                      <span className="recent-date">{formatWorkoutDate(workout.workout_date)}</span>
                      <Dumbbell className = "recent-dumbbell" size={22} />
                      <span>{Number(workout.workout_volume || 0).toLocaleString()} lbs</span>
                      <ChevronRight size={22} />
                    </Link>
                  ))}
                </div>
              </article>    
          </div>
          <article className="repforgeai-section">
            <div className="repforge-align">
                <div className="repforgeai-header">  
                    <span className = "repforgeai-text">RepForge AI</span>
                    
                 </div> 
                 <div className="repforgeai-message-box">
                    <div className="repforgeai-message"> 
                      <Sparkles className="sparkles-icon" size = {20}/>
                      <p className="default-message">{aiLoading ? "Thinking..." : aiError || aiReply}</p>
                        <div className="Suggested-Prompt">
                          <button type="button" disabled={aiLoading} onClick={() => askRepForgeAi("Suggest my next workout")}>
                            Suggest next workout <ChevronRight size={22} />
                          </button>

                          <button type="button" disabled={aiLoading} onClick={() => askRepForgeAi("Review my weekly volume")}>
                            Review weekly volume <ChevronRight size={22} />
                          </button>

                          <button type="button" disabled={aiLoading} onClick={() => askRepForgeAi("Give me recovery tips")}>
                            Recovery tips <ChevronRight size={22} />
                          </button>
                        </div>
                       
                    </div>
                    <form className="repforgeai-form" onSubmit={(event) => {event.preventDefault(); askRepForgeAi();
                      }}
                    >
                      <input type="text"value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)}
                        placeholder="Ask about workouts, volume, or recovery..."
                        disabled={aiLoading}
                      />

                      <button type="submit" disabled={aiLoading}>
                        <Send size={26} />
                      </button>
                    </form>
                 </div>
            </div>      
          </article> 
        </div>

    </main>
  );
}

export default DashboardPage;
