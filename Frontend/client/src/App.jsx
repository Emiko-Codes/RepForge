import { useState } from "react"; // This brings in React’s useState hook, which lets your component remember/change data.
import "./App.css";

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "Cardio",
  "Full Body"
];

const equipmentByMuscle = {
  Chest: ["Barbell", "Dumbbell", "Cable Machine", "Chest Press Machine", "Bodyweight"],
  Back: ["Barbell", "Dumbbell", "Cable Machine", "Lat Pulldown Machine", "Pull-up Bar"],
  Shoulders: ["Dumbbell", "Barbell", "Cable Machine", "Shoulder Press Machine", "Resistance Band"],
  Biceps: ["Dumbbell", "Barbell", "Cable Machine", "EZ Curl Bar", "Resistance Band"],
  Triceps: ["Cable Machine", "Dumbbell", "Barbell", "Dip Station", "Resistance Band"],
  Legs: ["Barbell", "Dumbbell", "Leg Press Machine", "Smith Machine", "Bodyweight"],
  Glutes: ["Barbell", "Dumbbell", "Cable Machine", "Resistance Band", "Bodyweight"],
  Core: ["Bodyweight", "Cable Machine", "Medicine Ball", "Ab Wheel", "Stability Ball"],
  Cardio: ["Treadmill", "Stationary Bike", "Rowing Machine", "Elliptical", "Jump Rope"],
  "Full Body": ["Dumbbell", "Kettlebell", "Barbell", "Resistance Band", "Bodyweight"]
};

const workoutDay = [
    "Push Day",
    "Pull Day",
    "Leg Day",
    "Other"
];

const defaultWorkout = {
  title: "Lets Get Started",
   date:  new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    }),
  notes: "Feeling Strong",
  exercises: [
    {
      id: crypto.randomUUID(), // crypto.randomUUID() creates a long unique string like: "7b9f1c2e-3a4d-4f6a-9c11-23b8e9f0a123"  Give this exercise or set a unique label so React and my code can track it properly.
      name: "Exercise 1",
      muscle: "Chest",
      equipment: "Barbell",
      sets: [
        {
          id: crypto.randomUUID(),
          weight: 135,
          reps: 8,
          rpe: 8,
          done: false
        }
      ]
    }
  ]
};

function App() {
const [workout, setWorkout] = useState(defaultWorkout);
const [message, setMessage] = useState("React state is working."); // // React state: stores the current workout and message; use setWorkout/setMessage to update the page when the user makes changes.
const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(workoutDay[0]);


function addExercise() {
  const newExercise = {
    id: crypto.randomUUID(),
    name: `Exercise ${workout.exercises.length + 1}`,
    muscle: "Chest",
    equipment: "Barbell",
    sets: [
      {
        id: crypto.randomUUID(),
        weight: 0,
        reps: 0,
        rpe: 0,
        done: false
      }
    ]
  };

  setWorkout({
    ...workout,
    exercises: [...workout.exercises, newExercise] // Keep the old workout, but replace the exercises array with a new array containing all old exercises plus the new one.
  });

  setMessage("Exercise added.");
}
function updateExercise(exerciseId, field, value) {
  const updatedExercises = workout.exercises.map((exercise) => {
    if (exercise.id !== exerciseId) {
      return exercise;
    }

    if (field === "muscle") {
      return {
        ...exercise,
        muscle: value,
        equipment: equipmentByMuscle[value][0] //If the thing the user is changing is the muscle group, update the muscle and automatically reset the equipment.
      };
    }

    return {
      ...exercise, //Copy everything from the old exercise first.
      [field]: value//This only runs if field is not "muscle". It handles all other scenarios like if the  field is something other than muscle.

    };
  });

  setWorkout({
    ...workout,
    exercises: updatedExercises
  });
}
function addSet(exerciseId) {
  const updatedExercises = workout.exercises.map((exercise) => {
    if (exercise.id !== exerciseId) {
      return exercise;
    }

    const newSet = {
      id: crypto.randomUUID(),
      weight: 0,
      reps: 0,
      rpe: 0,
      done: false
    };

    return {
      ...exercise,
      sets: [...exercise.sets, newSet] //Keep all the old sets, then add the new set at the end.
    };
  });

  setWorkout({
    ...workout,
    exercises: updatedExercises
  });

  setMessage("Set added.");
}
function deleteExercise(exerciseId) {
  const updatedExercises = workout.exercises.filter((exercise) => { // loops through all the exercises and returns all the exercise id's except the one passed into the function
    return exercise.id !== exerciseId;
  });

  setWorkout({
    ...workout, //Keep the rest of the workout the same, but replace the exercises list with the updated list.
    exercises: updatedExercises //replaces the old exercises array with the new one that no longer has the deleted exercise.
  });

  setMessage("Exercise deleted.");
}
  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <nav className="icons" aria-label="Workout navigation">
          <button className="icon-button active" type="button" title="Top">
            🏠
          </button>

          <button className="icon-button" type="button" title="Exercises">
            🏋️
          </button>

          <button className="icon-button" type="button" title="Summary">
            📊
          </button>

          <button className="icon-button" type="button" title="Reset workout">
            ↩️
          </button>
        </nav>
      </aside>

      <main className="page">
        <div className="page-inner">
          <header className="header">
            <div className="header-left">
              <h2>RepForge</h2>
              <p>{workout.date}</p>
            </div>

            <div className="header-centre">
                <h1 className="animated-title" aria-label={`${workout.title}. Train Hard.`}>
                    <span className="title-text title-first">{workout.title}</span>
                    <span className="title-text title-second">Train Hard</span>
                </h1>
                <label className="workout-day-picker">
                    <span>Workout Day</span>
                    <select
                        value={selectedWorkoutDay}
                        onChange={(event) => setSelectedWorkoutDay(event.target.value)}
                    >
                        {workoutDay.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </label>
                <p id="feedbackMessage">{message}</p>
            </div>

            <div className="header-right">
              <p>Duration: 0s</p>

              <div className="header-buttons">
                <button type="button" onClick={addExercise}>
                    Add Exercise
                </button>
                <button type="button">Save</button>
                <button type="button">Finish</button>
              </div>
            </div>
          </header>

          <section>
  {workout.exercises.map((exercise) => ( //That means React goes through every exercise inside: workout.exercises and automatically creates an exercise card for each one.


    <article className="exercise-card" key={exercise.id}>
      <div className="ex-top">
        <div>
            <input
            className="exercise-name-input"
            value={exercise.name}
            onChange={(event) =>
            updateExercise(exercise.id, "name", event.target.value) // allows the user to change the exercise name while react automatically updates
        }
/>

          <div className="exercise-selectors">
            <label>
              <span>Muscle Group</span>
              <select // creates the dropdown menu 
                className="exercise-select" // for css styling
                value={exercise.muscle} // which value is selcted
                onChange={(event) =>
                updateExercise(exercise.id, "muscle", event.target.value)
                }
                >
                {muscleGroups.map((muscle) => ( // displays the list of options 
                    <option key={muscle} value={muscle}>
                    {muscle}
                    </option>
            ))}
            </select>
            </label>

            <label>
              <span>Equipment</span>
            <select
                className="exercise-select"
                value={exercise.equipment}
                onChange={(event) =>
                updateExercise(exercise.id, "equipment", event.target.value)
            }
            >
            {equipmentByMuscle[exercise.muscle].map((equipment) => ( // // Shows equipment options that match the selected muscle group
                <option key={equipment} value={equipment}>
                {equipment}
                </option>
            ))}
            </select>
            </label>
          </div>
        </div>

        <div className="exercise-info">
          <button 
            className = "app-btn"
            type = "button"
            onClick = {() => deleteExercise(exercise.id)}
            > Delete</button>
        </div>
      </div>

      <table className="sets-table">
        <thead>
          <tr>
            <th>Set</th>
            <th>Weight</th>
            <th>Reps</th>
            <th>RPE</th>
            <th>Done</th>
          </tr>
        </thead>

        <tbody>
          {exercise.sets.map((set, index) => (
            <tr key={set.id}>
              <td>{index + 1}</td>
              <td>
                <input type="number" value={set.weight} readOnly />
              </td>
              <td>
                <input type="number" value={set.reps} readOnly />
              </td>
              <td>
                <input type="number" value={set.rpe} readOnly />
              </td>
              <td>
                <input type="checkbox" checked={set.done} readOnly />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="exercise-actions">
        <button 
            className = "app-btn"
            type = "button"
            onClick = {() => addSet(exercise.id)}
        >
            Add Set
        </button>
      </div>
    </article>
  ))}
</section>

          <section className="summary">
            <h2>Workout Summary</h2>

            <div className="summary-stats">
              <p>Exercises: 1</p>
              <p>Sets: 1</p>
              <p>Done: 0</p>
              <p>Notes: Feeling Strong</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
