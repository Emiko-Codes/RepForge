import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./DetailsPage.css";
import{
  CalendarDays,
  CircleCheck,
  CircleX,
  NotebookPen,
}from "lucide-react";
function DetailsPage() {
  const { id } = useParams();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    // Whenever this DetailsPage opens,
    // or whenever the workout ID changes,
    // get that workout from the backend.
    useEffect(() => {   // whenever the details page opens or whenever the workout id changes, get that workout from the backend.
      async function loadWorkoutDetails() {
        try {
          setLoading(true);
          setError("");
          const token = localStorage.getItem("repforgeToken");
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/workouts/${id}`, {
              headers:{
                Authorization: `Bearer ${token}`
              }
            }
          );

          const data = await response.json();

          if (!response.ok) {
            setError(data.message || "Could not load workout.");
            return;
          }

          setWorkout(data.workout);
        } catch (error) {
          console.log(error);
          setError("Could not connect to backend.");
        } finally {
          setLoading(false);
        }
      }

      loadWorkoutDetails();
    }, [id]);

  function formatWorkoutDate(workoutDate) {
    if (!workoutDate) {
      return "No date";
    }

    const dateOnly = workoutDate.split("T")[0];// Split date based on where there is a T and select the first part of each part (the year, month and day)
    const [year, month, day] = dateOnly.split("-");// split the date again based on where there is a "-" and assign each of those three values to year, month and day

    const date = new Date(
      Number(year),
      Number(month) - 1, //starts counting from 0
      Number(day)
    );

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  if (loading) {
    return (
      <main className="details-page"> 
        <p className="details-status">Loading workout...</p> 
      </main>
    );
  }

  if (error) {
    return (
      <main className="details-page"> 
        <p className="details-error">{error}</p> 
      </main>
    );
  }

  if (!workout) { // if there is no workout, then display an error message.
    return (
      <main className="details-page"> 
        <p className="details-error">Workout not found.</p> 
      </main>
    );
  }
  
  return (
    <main className="details-page">
      <div className="details-page-inner">
        <Link to="/history" className="back-to-history">
          ← Back to History
        </Link>

        <section className="workout-details-header">
          <h1 className="details-day" style={{ color: "#17345c" }}>
            {workout.workout_day}
          </h1>
        <div className="details-meta">

          <div className ="details-stat-symbol">
            <CalendarDays size ={19} />
            <span>{formatWorkoutDate(workout.workout_date)}</span>
          </div>
          <p className="separator">|</p>
          <div className ="details-stat-symbol">
            <NotebookPen size = {19} />
            {workout.notes && ( // conditional rendering that only displays <p> if workout.notes has a value 
              <span className="workout-details-notes">
                {workout.notes}
              </span>
          )}
          </div>
          </div>
        </section>
       
        <div className="exercise-details-list">
          {workout.exercises.map((exercise) => (
            <article
              className="exercise-details-card"
              key={exercise.id}
            >
              <h2 className="details-name">{exercise.name}</h2>

              <div className="set-details-list">
                 <table className="details-sets-table">
                    <thead>
                      <tr>
                        <th>SET</th>
                        <th>WEIGHT</th>
                        <th>REPS</th>
                        <th>RPE</th>
                        <th>DONE</th>
                      </tr>
                    </thead>

                    <tbody>
                      {exercise.sets.map((set) => (
                        <tr key={set.id}>
                          <td>{set.set_order}</td>
                          <td>{set.weight ?? "—"} lbs</td>
                          <td>{set.reps ?? "—"}</td>
                          <td>{set.rpe ?? "—"}</td>
                          <td>{set.done ? <CircleCheck className="circlecheck-logo" size ={24} /> : <CircleX className="circlex-logo" size = {24} />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default DetailsPage;
