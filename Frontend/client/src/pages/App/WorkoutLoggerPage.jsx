import { useRef, useState, useMemo, useEffect } from 'react'; // This brings in React’s useState hook, which lets your component remember/change data.
import {
  CirclePlus,
  CalendarDays,
  CheckCircle2,
  Plus,
  Trash2,
  CircleArrowUp,
}from "lucide-react";


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
  notes: "",
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
const workoutDraftKey = "repforgeWorkoutDraft";

function getSavedWorkoutDraft() {
  // localStorage stores text, so this helper reads the text and turns it back into JavaScript data.
  const savedDraft = localStorage.getItem(workoutDraftKey);

  if (!savedDraft) {
    return null;
  }

  try {
    return JSON.parse(savedDraft);
  } catch (error) {
    // If the saved text ever gets corrupted, remove it so the logger can start fresh instead of crashing.
    console.log(error);
    localStorage.removeItem(workoutDraftKey);
    return null;
  }
}

function WorkoutLoggerPage() {
const savedWorkoutDraft = getSavedWorkoutDraft();
const [workout, setWorkout] = useState(() => {
  // This runs only when the logger first opens. It restores the saved draft if one exists.
  return savedWorkoutDraft?.workout || defaultWorkout;
});
const [message, setMessage] = useState(""); // React state: stores save/status messages that should be shown on the page.
const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(() => {
  // The workout day is separate state, so it gets saved/restored beside the workout object.
  return savedWorkoutDraft?.selectedWorkoutDay || workoutDay[0];
});
const [duration, setDuration] = useState(0); // Stores how many seconds have passed
const [timerRunning, setTimerRunning] = useState(false); // Stores whether the timer should currently be counting
const [, setFinishedDuration] = useState(0);
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState("");
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

useEffect(() => {
  // Whenever the workout draft changes, save the newest version in the browser.
  localStorage.setItem(workoutDraftKey, JSON.stringify({
    workout,
    selectedWorkoutDay
  }));
}, [workout, selectedWorkoutDay]);

useEffect(() => {
  if (!timerRunning) {
    return;
  }

  const timer = setInterval(() => {
    setDuration((previousDuration) => previousDuration + 1);
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, [timerRunning]);

function startTimer() {
  setTimerRunning(true);
}
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
}
function topScroll (){
  topRef.current?.scrollIntoView({
    behavior : "smooth",
    block: "start"
  });
}
 function convertDisplayDateToInputDate(displayDate) {
  const parsedDate = new Date(displayDate);
  return parsedDate.toISOString().split("T")[0];
}

async function saveFullWorkoutToBackend() {
  try {
    setSaving(true);
    setMessage("");
    setSaveError("");
    const token = localStorage.getItem("repforgeToken");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...workout,
        date: convertDisplayDateToInputDate(workout.date),
        workoutDay: selectedWorkoutDay
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setSaveError(data.message || "Could not save workout.");
      return;
    }

    localStorage.removeItem(workoutDraftKey); // Once the backend saves the workout, the browser draft is no longer needed.
    setMessage(`Workout saved`);
  } catch (error) {
    console.log(error);
    setSaveError("Could not connect to backend.");
  } finally {
    setSaving(false);
  }
 
}
 async function finishWorkout(){
    setTimerRunning(false);
    setFinishedDuration(duration);

    await saveFullWorkoutToBackend();
  }

return (
  <main className="page">
    <div className="page-inner">
      <div className="page-align">
      <header className="header" ref = {topRef}>
            <div className="welcome-info">
              <span className="title-text">{workout.title}</span>
              <span className="title-subtext">Train Hard</span>
            </div>  
            <div className="start-workout-button-area">
              
              <button
                className="finish-workout-button"
                type="button"
                onClick ={timerRunning ? finishWorkout : startTimer}
                disabled={saving}
              >
                {timerRunning ? <CheckCircle2 size ={20}/> : <CirclePlus size ={20}/>}
                {saving ? "Saving..." : timerRunning ? "Finish Workout" : "Start Workout"}
              </button>
            </div>
          
      </header>

      {(saving || saveError || message) && (
        <section className="workout-feedback">
          {saving && <p>Saving workout...</p>}
          {!saving && saveError && <p className="workout-feedback-error">{saveError}</p>}
          {!saving && !saveError && message && <p>{message}</p>}
        </section>
      )}

      <section className ="header-navs">
        <div className="header-navs-left">
          <CalendarDays size={39}/>
          <span className="workout-date-ic">{workout.date}</span>
        </div>

        <div className="header-navs-centre">
          
          <label className="workout-day-picker">
            
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
          
        </div>

        <div className="header-navs-right">
          <p>Duration: {duration}s</p>

          <div className="header-navs-buttons">
            <button
              className="workout-icon-button"
              type="button"
              onClick={addExercise}
              aria-label="Add exercise"
            >
              <Plus size={27}/>
            </button>
            
            
          </div>
        </div>

      </section>

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
                  className = "workout-delete-button"
                  type = "button"
                  onClick = {() => deleteExercise(exercise.id)}
                  aria-label="Delete exercise"
                >
                  <Trash2 size={24}/>
                </button>
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
                        className="workout-delete-button"
                        type="button"
                        onClick={() => deleteSet(exercise.id, set.id)}
                        aria-label="Delete set"
                      >
                        <Trash2 size={24}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="exercise-actions">
              <button
                className = "workout-text-button"
                type = "button"
                onClick = {() => addSet(exercise.id)}
              >
                <CirclePlus size={23}/>
              </button>
            </div>
          </article>
        ))}
      </section>

    

      <section  className="summary" ref = {summaryRef}>
        <h2 className="workout-summary-footer">Workout Summary</h2>

        <div className="summary-stats">
          <p>Exercises: {summary.exercises}</p>
          <p>Sets: {summary.totalSets}</p>
          <p>Done: {summary.doneSets}</p>
          <p>Volume: {summary.totalVolume} lbs</p>

          <label className="summary-notes">
            <span>Notes</span> {/* Text label shown above/next to the notes box */}

            <textarea className="text-area"
              value={workout.notes} // Shows the current notes value from React state
              onChange={(event) =>
                setWorkout({
                  ...workout, // Keep the rest of the workout the same
                  notes: event.target.value // Replace only the notes with what the user typed
                })
              }
              placeholder="Add workout notes..." // Grey hint text when notes is empty
            />
          </label>
        </div>
      </section>
      <section className="scroll-top-area">
        <button
          className = "scroll-top-button"
          type = "button"
          onClick = {topScroll}
          aria-label="Back to top"
        >
          <CircleArrowUp size={34}/>
        </button>
      </section>
      </div>
    </div>
  </main>
);
}

export default WorkoutLoggerPage;
