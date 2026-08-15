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

function WorkoutLoggerPage() {
const [workout, setWorkout] = useState(defaultWorkout);
const [message, setMessage] = useState("React state is working."); // // React state: stores the current workout and message; use setWorkout/setMessage to update the page when the user makes changes.
const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(workoutDay[0]);
const [duration, setDuration] = useState(0); // Stores how many seconds have passed
const [timerRunning, setTimerRunning] = useState(false); // Stores whether the timer should currently be counting
const [finishedDuration,setFinishedDuration] = useState(0);
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

async function saveToBackend() { // Creates an asynchronous function so it can wait for the backend request and response.
  try { // Runs code that could fail and sends any thrown error to the catch block.

    const response = await fetch( // Sends an HTTP request and waits until the backend responds.
      `${import.meta.env.VITE_API_URL}/api/workouts/test`, // Combines the backend base URL with the backend route path.
      {
        method: "POST", // Uses the POST HTTP method because workout data is being sent to the backend.

        headers: { // Provides information about the format of the request.
          "Content-Type": "application/json" // Tells the backend that the request body contains JSON data.
        },

        body: JSON.stringify({ // Converts the JavaScript object into JSON text so it can be sent through HTTP.
          ...workout, // Copies all properties from the existing workout object into this new object.
          workoutDay: selectedWorkoutDay // Adds the selected workout day to the object being sent.
        })
      }
    );

    const data = await response.json(); // Reads the backend's JSON response and converts it into a JavaScript object.

    if (!response.ok) { // Checks whether the backend returned an unsuccessful HTTP status code.
      setMessage("Backend save failed."); // Updates the React message state to show that the backend rejected or failed the request.
      console.log(data); // Prints the backend's response data in the browser console for debugging.
      return; // Stops the function so the success code below does not run.
    }

    setMessage(data.message); // Displays the success message returned by the backend.
    console.log("Backend response:", data); // Prints the complete successful backend response in the browser console.
    /*
    since these three match:
    Backend address: http://localhost:5001
    HTTP method: POST
    Route path: /api/workouts/test , this post request runs the "default" post function in the server.js file.
    */

  } catch (error) { // Runs when the request cannot complete normally or another error is thrown inside the try block.
    console.log(error); // Prints the actual error in the browser console for debugging.
    setMessage("Could not connect to backend."); // Updates the React message when the frontend cannot complete the connection.
  }

 
}
 function convertDisplayDateToInputDate(displayDate) {
  const parsedDate = new Date(displayDate);
  return parsedDate.toISOString().split("T")[0];
}

async function saveFullWorkoutToBackend() {
  try {
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
      setMessage(data.message || "Could not save workout.");
      return;
    }

    setMessage(`Workout saved. ID: ${data.workoutId}`);
  } catch (error) {
    console.log(error);
    setMessage("Could not connect to backend.");
  }
 
}
 function finishWorkout(){
    setTimerRunning(false);
    setFinishedDuration(duration);

    saveFullWorkoutToBackend();
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
              >
                {timerRunning ? <CheckCircle2 size ={20}/> : <CirclePlus size ={20}/>}
                {timerRunning ? "Finish Workout" : "Start Workout"}
              </button>
            </div>
          
      </header>

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
