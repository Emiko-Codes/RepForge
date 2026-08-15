import { useEffect, useState } from "react";
import "./HistoryPage.css";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  CalendarDays,
  Layers3,
  Trash2,
} from "lucide-react";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkoutHistory() {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("repforgeToken");
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}` // used to confirm who the user is first before displaying the workout history
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Could not load history.");
          return;
        }

        setHistory(data.workouts);
        setMessage("View and revisit your past training sessions");
      } catch (error) {
        console.log(error);
        setError("Could not connect to backend.");
      } finally {
        setLoading(false);
      }
    }

    loadWorkoutHistory();
  }, []);
function formatWorkoutDate(workoutDate) {
  if (!workoutDate) {
    return "No date";
  }

  const dateOnly = workoutDate.split("T")[0]; //It produces an array containing the part before the "T" and the part after it. selects the first part, which contains only the calendar date.                                   
  const [year, month, day] = dateOnly.split("-"); // uses array destructuring to take values from the array made and stored in dateOnly and stores them in order of the year, month and day

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return date.toLocaleDateString("en-US", { //This converts the Date object into formatted text.
    month: "long",   //These control how each dat should appeat
    day: "numeric",
    year: "numeric",  
  });
}
async function deleteSavedWorkout(workoutId) {
  try {
    const token = localStorage.getItem("repforgeToken");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not delete workout.");
      return;
    }

    setHistory((currentHistory) => // currentHistory is the latest history state before React updates it.
      currentHistory.filter((savedWorkout) => savedWorkout.id !== workoutId) // filter returns a new array without the deleted workout.
    );

    setMessage(data.message);
  } catch (error) {
    console.log(error);
    setMessage("Could not connect to backend.");
  }
}
  return (
    <main className="history-page">
      <div className="page-inner">
        <h1 className="history-title">Workout History</h1>

        <p className="top-message">{message}</p>

        <div className="history-list">
          {loading && <p className="history-status">Loading workout history...</p>}
          {!loading && error && <p className="history-error">{error}</p>}
          {!loading && !error && history.length === 0 && (
            <p className="history-status">No workouts logged yet.</p>
          )}
          {!loading && !error && history.map((workout) => (
            <article className="history-card" key={workout.id}>{/* Left blue icon box */}
            
              <div className="history-card-icon">
                <Dumbbell size={36} />
              </div>

              <div className="history-card-main">{/* Workout title, date, day and notes */}
                <h2 className = "history-day">{workout.workout_day}</h2>

                <div className="history-card-meta">
                  <CalendarDays size={19} />

                  <span className = "history-date">
                    {formatWorkoutDate(workout.workout_date)}
                  </span>

                  
                </div>

                {workout.notes && (
                  <p className="history-notes">
                    {workout.notes}
                  </p>
                )}
              
            </div>
           <div className="history-card-stats">
                <div className = "history-stat-symbol">
                  <Dumbbell size={19} />
                  <span>{workout.exercise_count} exercises</span>
                </div>

                <div className = "history-stat-symbol">
                  <Layers3 size={19} />
                  <span>{workout.set_count} sets</span>
                </div>
              </div>
              <Link
                className="view-workout-button"
                to={`/history/${workout.id}`}               
              >
                View Workout
              </Link>

              <button
                className="history-menu-button"
                type="button"
                onClick={() => deleteSavedWorkout(workout.id)}
                aria-label="Delete workout"
              >
                <Trash2 size={25} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default HistoryPage;
