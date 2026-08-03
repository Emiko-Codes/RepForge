import { useRef, useState, useMemo } from 'react'; // This brings in React’s useState hook, which lets your component remember/change data.
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
          weight: "",
          reps: "",
          rpe: "",
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
const summaryRef = useRef(null);
const topRef = useRef(null);
const summary = useMemo(() => { // useMemo so summary only updates when the workout is updated.
  let totalSets = 0;
  let doneSets = 0;
  let totalVolume = 0;

  workout.exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      totalSets++;
      if (set.done) {
        doneSets++;
        totalVolume += Number(set.weight) * Number(set.reps);
      }
    });
  });

  return {
    exercises: workout.exercises.length,
    totalSets,
    doneSets,
    totalVolume
  };
}, [workout]); //Remember this summary, and only update it when the workout data changes.(syntax for useMemo) 

function addExercise() {
  const newExercise = {
    id: crypto.randomUUID(),
    name: `Exercise ${workout.exercises.length + 1}`,
    muscle: "Chest",
    equipment: "Barbell",
    sets: [
      {
        id: crypto.randomUUID(),
        weight: "",
        reps: "",
        rpe: "",
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
      weight: "",
      reps: "",
      rpe: "",
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

function updateSet(exerciseId, setId, field, value) {
  const updatedExercises = workout.exercises.map((exercise) => {
    if (exercise.id !== exerciseId) {
      return exercise;
    }

    const updatedSets = exercise.sets.map((set) => {
      if (set.id !== setId) {
        return set;  // if we loop through the sets and the set id that we loop through does not match with the SetId that is an input parameter, then skip it.
      }

      return {
        ...set,
        [field]: field === "done" ? value : value === "" ? "" : Number(value) //if it is the checkbox, keep true/falseif the input is empty, keep it emptyotherwise, convert it to a number
      };
    });

    return {
      ...exercise,
      sets: updatedSets
    };
  });

  setWorkout({
    ...workout,
    exercises: updatedExercises
  });
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
function deleteSet(exerciseId, setId) {
  const updatedExercises = workout.exercises.map((exercise) => {
    if (exercise.id !== exerciseId) {
      return exercise;
    }

    const updatedSets = exercise.sets.filter((set) => {
      return set.id !== setId;
    });

    return {
      ...exercise,
      sets: updatedSets
    };
  });

  setWorkout({
    ...workout,
    exercises: updatedExercises
  });

  setMessage("Set deleted.");
}
function summaryScroll(){
  summaryRef.current?.scrollIntoView({
    behavior: "smooth",
    block : "start"
});
}
function topScroll (){
  topRef.current?.scrollIntoView({
    behavior : "smooth",
    block: "start"
  });
}
function saveToBrowser(){
  localStorage.setItem("reactWorkout", JSON.stringify(workout)); //JSON.Stringify is the syntax for saving react files to the browser
  setMessage("workout saved in browser");
}
function loadFromBrowser(){
  const savedWorkout = localStorage.getItem("reactWorkout");

  if (!savedWorkout){
    setMessage("No workout Saved")
    return{
      ...workout
    }
  }
  setWorkout(JSON.parse(savedWorkout));// JSON.parse is used to change from string to a JSON readable file.
  setMessage("Workout loaded from browser");
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

          <button 
          className="icon-button" 
          type="button" 
          title="Summary"
          onClick = {summaryScroll} >
            📊
          </button>

          <button className="icon-button" type="button" title="Reset workout">
            ↩️
          </button>
        </nav>
      </aside>

      <main className="page">
        <div className="page-inner">
          <header className="header" ref = {topRef}>
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
                <button type="button" onClick = {saveToBrowser}>Save</button>
                <button type ="button" onClick = {loadFromBrowser}>load</button>
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {exercise.sets.map((set, index) => (
            <tr key={set.id}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="number"
                  value={set.weight}
                  onChange={(event) =>
                    updateSet(exercise.id, set.id, "weight", event.target.value) // event stores the value that was unterd by the user. It is then passed into the updateSet function
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={set.reps}
                  onChange={(event) =>
                    updateSet(exercise.id, set.id, "reps", event.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={set.rpe}
                  onChange={(event) =>
                    updateSet(exercise.id, set.id, "rpe", event.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={set.done}
                  onChange={(event) =>
                    updateSet(exercise.id, set.id, "done", event.target.checked)
                  }
                />
              </td>
              <td>
                <button
                  className="app-btn"
                  type="button"
                  onClick={() => deleteSet(exercise.id, set.id)}
                >
                  Delete Set
                </button>
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

          <section  className="summary" ref = {summaryRef}>
            <h2>Workout Summary</h2>

            <div className="summary-stats">
              <p>Exercises: {summary.exercises}</p>
              <p>Sets: {summary.totalSets}</p>
              <p>Done: {summary.doneSets}</p>
              <p>Volume: {summary.totalVolume} lbs</p>
            </div>
          </section>
          <section>
            <button className = "app-btn" type = "button"
            onClick = {topScroll} >
              ⬆

            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
