import { useEffect, useState } from "react";
import "./HistoryPage.css";
import {
  Dumbbell,
  CalendarDays,
  Layers3,
  MoreVertical,
} from "lucide-react";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  async function loadWorkoutHistory() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workouts`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not load history.");
        return;
      }

      setHistory(data.workouts);
      setMessage("view and revisit your past training sessions");
    } catch (error) {
      console.log(error);
      setMessage("Could not connect to backend.");
    }
  }

  useEffect(() => {
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
  return (
    <main className="history-page">
      <div className="page-inner">
        <h1 class="history-title">Workout History</h1>

        <p className="top-message">{message}</p>

        <div className="history-list">
          {history.map((workout) => (
            <article className="history-card" key={workout.id}>{/* Left blue icon box */}
              <div className="history-card-icon">
                <Dumbbell size={36} />
              </div>

              <div className="history-card-main">{/* Workout title, date, day and notes */}
                <h2>{workout.title}</h2>

                <div className="history-card-meta">
                  <CalendarDays size={19} />

                  <span>
                    {formatWorkoutDate(workout.workout_date)}
                  </span>

                  <span className="history-separator">•</span>

                  <span className="history-day">
                    {workout.workout_day}
                  </span>
                </div>

                {workout.notes && (
                  <p className="history-notes">
                    {workout.notes}
                  </p>
                )}
              </div>

              {/* Add this section when the backend returns counts */}
              {workout.exercise_count !== undefined &&
                workout.set_count !== undefined && (
                  <div className="history-card-stats">
                    <div>
                      <Dumbbell size={19} />
                      <span>
                        {workout.exercise_count} exercises
                      </span>
                    </div>

                    <div>
                      <Layers3 size={19} />
                      <span>{workout.set_count} sets</span>
                    </div>
                  </div>
                )}

              <button
                className="view-workout-button"
                type="button"
              >
                View Workout
              </button>

              <button
                className="history-menu-button"
                type="button"
                aria-label="Workout options"
              >
                <MoreVertical size={25} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default HistoryPage;
