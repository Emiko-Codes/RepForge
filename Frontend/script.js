// Grab the main parts of the page that JavaScript needs to update.
const exerciseList = document.getElementById("exerciseList");
const addExerciseBtn = document.getElementById("addExerciseBtn");
const saveWorkoutBtn = document.getElementById("saveWorkoutBtn");
const finishButton = document.getElementById("finishButton");
const currentDate = document.getElementById("currentDate");
const feedbackMessage = document.getElementById("feedbackMessage");
const notesText = document.getElementById("notesText");

const exerciseCount = document.getElementById("exerciseCount");
const setCount = document.getElementById("setCount");
const doneCount = document.getElementById("doneCount");

const workoutTitle = document.getElementById("workoutTitle");
const workoutDuration = document.getElementById("workoutDuration");

const storageKey = "workoutTrackerData";
let durationTimerId = null;

const muscleGroups = [
  "Muscle Group",
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
  "Muscle Group": ["Equipment"],
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

const defaultWorkout = {
  title: "Push Day",
  date: "March 9, 2026",
  duration: 0,
  durationSeconds: 0 * 60,
  isRunning: false,
  startedAt: null,
  notes: "Feeling Strong",
  exercises: [
    {
      name: "Exercise 1",
      muscle: "Chest",
      equipment: "Barbell",
      active: false,
      sets: [
        { weight: 134, reps: 8, rpe: 8, done: false },
        { weight: 135, reps: 8, rpe: 8, done: false },
        { weight: 140, reps: 6, rpe: 9, done: false }
      ]
    }
  ]
};

let workout = structuredClone(defaultWorkout);

function cloneDefaultWorkout() {
  return structuredClone(defaultWorkout);
}

function normalizeWorkout() {
  if (typeof workout.durationSeconds !== "number") {
    workout.durationSeconds = Number(workout.duration || 0) * 60;
  }

  if (typeof workout.isRunning !== "boolean") {
    workout.isRunning = false;
  }

  if (typeof workout.startedAt !== "number") {
    workout.startedAt = null;
  }
}

function getEquipmentOptions(muscle) {
  return equipmentByMuscle[muscle] || ["Equipment"];
}

function buildOptions(options, selectedValue) {
  return options.map((option) => `
    <option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>
  `).join("");
}

function normalizeExercise(exercise) {
  if (!muscleGroups.includes(exercise.muscle)) {
    exercise.muscle = "Muscle Group";
  }

  const equipmentOptions = getEquipmentOptions(exercise.muscle);

  if (!equipmentOptions.includes(exercise.equipment)) {
    exercise.equipment = equipmentOptions[0];
  }

  if (typeof exercise.active !== "boolean") {
    exercise.active = false;
  }
}

// Default exercise when the user adds a new one.
function createNewExercise() {
  return {
    name: `Exercise ${workout.exercises.length + 1}`,
    muscle: "Muscle Group",
    equipment: "Equipment",
    active: false,
    sets: [
      { weight: 0, reps: 0, rpe: 0, done: false }
    ]
  };
}

function showMessage(message) {
  feedbackMessage.textContent = message;
}

function getCurrentDurationSeconds() {
  if (workout.isRunning && workout.startedAt) {
    return workout.durationSeconds + Math.floor((Date.now() - workout.startedAt) / 1000);
  }

  return workout.durationSeconds;
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function updateDurationDisplay() {
  workoutDuration.textContent = formatDuration(getCurrentDurationSeconds());
}

function startDurationDisplayTimer() {
  if (durationTimerId) {
    return;
  }

  durationTimerId = setInterval(updateDurationDisplay, 1000);
}

function stopDurationDisplayTimer() {
  if (durationTimerId) {
    clearInterval(durationTimerId);
    durationTimerId = null;
  }
}

function syncDurationDisplayTimer() {
  if (workout.isRunning) {
    startDurationDisplayTimer();
  } else {
    stopDurationDisplayTimer();
  }

  updateDurationDisplay();
}

function startWorkoutTimer() {
  if (workout.isRunning) {
    syncDurationDisplayTimer();
    return false;
  }

  workout.isRunning = true;
  workout.startedAt = Date.now();
  saveWorkout();
  syncDurationDisplayTimer();
  return true;
}

function finishWorkoutTimer() {
  workout.durationSeconds = getCurrentDurationSeconds();
  workout.duration = Math.floor(workout.durationSeconds / 60);
  workout.isRunning = false;
  workout.startedAt = null;
  syncDurationDisplayTimer();
}

// Refresh the main workout display.
function renderWorkout() {
  workoutTitle.textContent = workout.title;
  currentDate.textContent = workout.date;
  notesText.textContent = workout.notes;
  syncDurationDisplayTimer();

  renderExercises();
  updateSummary();
}

// Build the exercise cards from the workout data.
function renderExercises() {
  exerciseList.innerHTML = "";

  workout.exercises.forEach((exercise, exerciseIndex) => {
    normalizeExercise(exercise);

    const card = document.createElement("article");
    card.className = `exercise-card${exercise.active ? " active-exercise" : ""}`;

    card.innerHTML = `
      <div class="ex-top">
        <div>
          <h3>${exercise.name}</h3>
          <div class="exercise-selectors">
            <label>
              <span>Muscle Group</span>
              <select class="exercise-select muscle-select" data-exercise-index="${exerciseIndex}">
                ${buildOptions(muscleGroups, exercise.muscle)}
              </select>
            </label>

            <label>
              <span>Equipment</span>
              <select class="exercise-select equipment-select" data-exercise-index="${exerciseIndex}">
                ${buildOptions(getEquipmentOptions(exercise.muscle), exercise.equipment)}
              </select>
            </label>
          </div>
        </div>

        <div class="exercise-info">
          <button class="app-btn start-btn" type="button" data-exercise-index="${exerciseIndex}">
            ${exercise.active ? "Started" : "Start"}
          </button>
          <button class="app-btn menu-btn" type="button" data-exercise-index="${exerciseIndex}" aria-label="Delete ${exercise.name}">
            Delete
          </button>
        </div>
      </div>

      <table class="sets-table">
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
          ${exercise.sets.map((set, setIndex) => `
            <tr>
              <td>${setIndex + 1}</td>
              <td>
                <input type="number" min="0" value="${set.weight}" class="set-input" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}" data-field="weight" />
              </td>
              <td>
                <input type="number" min="0" value="${set.reps}" class="set-input" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}" data-field="reps" />
              </td>
              <td>
                <input type="number" min="0" max="10" value="${set.rpe}" class="set-input" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}" data-field="rpe" />
              </td>
              <td>
                <input type="checkbox" class="done-checkbox" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}" ${set.done ? "checked" : ""} />
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="exercise-actions">
        <button class="app-btn add-set-btn" type="button" data-exercise-index="${exerciseIndex}">
          Add Set
        </button>
      </div>
    `;

    exerciseList.appendChild(card);
  });
}

// Update the summary numbers.
function updateSummary() {
  const totalExercises = workout.exercises.length;
  let totalSets = 0;
  let totalDone = 0;

  workout.exercises.forEach((exercise) => {
    totalSets += exercise.sets.length;

    exercise.sets.forEach((set) => {
      if (set.done) {
        totalDone++;
      }
    });
  });

  exerciseCount.textContent = totalExercises;
  setCount.textContent = totalSets;
  doneCount.textContent = totalDone;
}

// Save the workout in the browser.
function saveWorkout() {
  localStorage.setItem(storageKey, JSON.stringify(workout));
}

// Load saved workout data, if it exists.
function loadWorkout() {
  const savedWorkout = localStorage.getItem(storageKey);

  if (savedWorkout) {
    workout = JSON.parse(savedWorkout);
    normalizeWorkout();
    workout.exercises.forEach(normalizeExercise);
  }
}

addExerciseBtn.addEventListener("click", () => {
  workout.exercises.push(createNewExercise());
  renderWorkout();
  showMessage("Exercise added.");
});

saveWorkoutBtn.addEventListener("click", () => {
  saveWorkout();
  showMessage("Workout saved.");
});

finishButton.addEventListener("click", () => {
  finishWorkoutTimer();

  workout.exercises.forEach((exercise) => {
    exercise.active = false;
    exercise.sets.forEach((set) => {
      set.done = true;
    });
  });

  saveWorkout();
  renderWorkout();
  showMessage("Workout finished and saved.");
});

exerciseList.addEventListener("click", (event) => {
  const exerciseIndex = Number(event.target.dataset.exerciseIndex);

  if (event.target.classList.contains("add-set-btn")) {
    workout.exercises[exerciseIndex].sets.push({
      weight: 0,
      reps: 0,
      rpe: 0,
      done: false
    });

    renderWorkout();
    showMessage("Set added.");
  }

  if (event.target.classList.contains("start-btn")) {
    const timerStarted = startWorkoutTimer();

    workout.exercises.forEach((exercise, index) => {
      exercise.active = index === exerciseIndex;
    });

    renderWorkout();
    showMessage(timerStarted ? "Workout timer started." : "Workout timer is still running.");
  }

  if (event.target.classList.contains("menu-btn")) {
    const exerciseName = workout.exercises[exerciseIndex].name;
    workout.exercises.splice(exerciseIndex, 1);
    renderWorkout();
    showMessage(`${exerciseName} deleted.`);
  }
});

// Update weight, reps, or RPE when the user types.
exerciseList.addEventListener("input", (event) => {
  if (event.target.classList.contains("set-input")) {
    const exerciseIndex = Number(event.target.dataset.exerciseIndex);
    const setIndex = Number(event.target.dataset.setIndex);
    const field = event.target.dataset.field;

    workout.exercises[exerciseIndex].sets[setIndex][field] = Number(event.target.value);
    updateSummary();
  }
});

// Update done status when a checkbox changes.
exerciseList.addEventListener("change", (event) => {
  if (event.target.classList.contains("muscle-select")) {
    const exerciseIndex = Number(event.target.dataset.exerciseIndex);
    const selectedMuscle = event.target.value;
    const equipmentOptions = getEquipmentOptions(selectedMuscle);

    workout.exercises[exerciseIndex].muscle = selectedMuscle;
    workout.exercises[exerciseIndex].equipment = equipmentOptions[0];
    renderWorkout();
    showMessage("Muscle group updated.");
  }

  if (event.target.classList.contains("equipment-select")) {
    const exerciseIndex = Number(event.target.dataset.exerciseIndex);

    workout.exercises[exerciseIndex].equipment = event.target.value;
    showMessage("Equipment updated.");
  }

  if (event.target.classList.contains("done-checkbox")) {
    const exerciseIndex = Number(event.target.dataset.exerciseIndex);
    const setIndex = Number(event.target.dataset.setIndex);

    workout.exercises[exerciseIndex].sets[setIndex].done = event.target.checked;
    updateSummary();
  }
});

document.querySelectorAll(".icon-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".icon-button").forEach((navButton) => {
      navButton.classList.remove("active");
    });

    button.classList.add("active");

    if (button.dataset.nav === "top") {
      document.getElementById("top").scrollIntoView({ behavior: "smooth" });
      showMessage("Back to the top.");
    }

    if (button.dataset.nav === "workout") {
      exerciseList.scrollIntoView({ behavior: "smooth" });
      showMessage("Exercises selected.");
    }

    if (button.dataset.nav === "summary") {
      document.getElementById("summary").scrollIntoView({ behavior: "smooth" });
      showMessage("Summary selected.");
    }

    if (button.dataset.nav === "reset") {
      stopDurationDisplayTimer();
      localStorage.removeItem(storageKey);
      workout = cloneDefaultWorkout();
      renderWorkout();
      showMessage("Workout reset.");
    }
  });
});

loadWorkout();
renderWorkout();
