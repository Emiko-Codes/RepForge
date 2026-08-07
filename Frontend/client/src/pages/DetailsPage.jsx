import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./DetailsPage.css";

function DetailsPage() {
  const { id } = useParams();

  const [workout, setWorkout] = useState(null);
  const [message, setMessage] = useState("Loading workout...");

  async function loadWorkoutDetails() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workouts/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not load workout.");
        return;
      }

      setWorkout(data.workout);
      setMessage("");
    } catch (error) {
      console.log(error);
      setMessage("Could not connect to backend.");
    }
  }

  useEffect(() => {
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

  if (!workout) { // if there is no workout, then display an error message.
    return (
      <main className="details-page"> 
        <p>{message}</p> 
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
          <h1 className="details-day">{workout.workout_day}</h1>

          <p>{formatWorkoutDate(workout.workout_date)}</p>

          {workout.notes && ( // conditional rendering that only displays <p> if workout.notes has a value
            <p className="workout-details-notes">
              {workout.notes}
            </p>
          )}
        </section>

        <div className="exercise-details-list">
          {workout.exercises.map((exercise) => (
            <article
              className="exercise-details-card"
              key={exercise.id}
            >
              <h2>{exercise.name}</h2>

              <div className="set-details-list">
                {exercise.sets.map((set) => ( // Go through every set and display one paragraph for each set
                  <p key={set.id}> 
                    Set {set.set_order}:{" "}
                    {set.weight ?? "—"} lbs ×{" "} 
                    {set.reps ?? "—"} 
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default DetailsPage;