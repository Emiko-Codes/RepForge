const exerciseList = document.getElementById("exrecisList")
const addExerciseButton = document.getElementById("addExerciseButton");
const saveButton = document.getElementById("saveButton");
const finsihButton = document.getElementById("finishButton");

const exerciseCount = document.getElementById("exerciseCount");
const setsCount = document.getElementById("setsCount");


const workoutTitle = document.getElementById("workoutTitle");
const workoutDuration = document.getElementById("workoutDuration");


let workout = {
    title: "Push Day",
    date: "March 9 2026",
    duration: 42,
    exercises: [
        {
            name: "Bench Press",
            muscle: "Chest",
            equipment: "Barbell",
            sets: [
                {weight: 134, reps: 8, rpe: 8, done: false}
                {weight: 134, reps: 8, rpe: 8, done: false}
                {weight: 134, reps: 8, rpe: 8, done: false}
            ]
        }
    ]
};

function renderWorkout(){
    workoutTitle.textContent = workout.title;
    workoutDuration.textContent = workout.duration

    renderExercises();
    updateSummary();
}

function renderExercises() {
  exerciseList.innerHTML = ""; //This clears whatever is currently inside exerciseList.

  workout.exercises.forEach((exercise, exerciseIndex) => { //For each exercise, give me the exercise itself and also its index number.
    const card = document.createElement("article");//This creates a new HTML element using JavaScript. It is like writing this in HTML:<article></article>
    card.className = "exercise-card";//adds a class to it,  <article class="exercise-card"></article>   The class connects it to the CSS
    // The ` is called a template literal and it allows to writwe a big block of HTML or text acroos multimple lines
    card.innerHTML = ` 
      <div class="exercise-card-header">
        <div>
          <h3>${exercise.name}</h3>   <!-- This syntax means insert a JavaScript Value here-->
          <p>${exercise.muscle} • ${exercise.equipment}</p>
        </div>
        <div>
          <button class="start-btn">Start</button>
          <button class="menu-btn">...</button>
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
          ${exercise.sets.map((set, setIndex) => ` <!--For each set, give me the set itself and its index number. -->
            <tr>
              <td>${setIndex + 1}</td>
              <td>
                <input
                  type="number"
                  value="${set.weight}"
                  class="set-input"
                  data-exercise-index="${exerciseIndex}"
                  data-set-index="${setIndex}"
                  data-field="weight"
                />
              </td>
              <td>
                <input
                  type="number"
                  value="${set.reps}"
                  class="set-input"
                  data-exercise-index="${exerciseIndex}"
                  data-set-index="${setIndex}"
                  data-field="reps"
                />
              </td>
              <td>
                <input
                  type="number"
                  value="${set.rpe}"
                  class="set-input"
                  data-exercise-index="${exerciseIndex}"
                  data-set-index="${setIndex}"
                  data-field="rpe"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  class="done-checkbox"
                  data-exercise-index="${exerciseIndex}"
                  data-set-index="${setIndex}"
                  ${set.done ? "checked" : ""}
                />
              </td>
            </tr>
          `).join("")} <!--combines the above arrayinto one big string-->
        </tbody>
      </table>

      <div class="exercise-card-footer">
        <button
          class="add-set-btn"
          data-exercise-index="${exerciseIndex}"
        >
          Add Set
        </button>
      </div>
    `;

    exerciseList.appendChild(card);
  });
}/* 
Main Syntax to Understand:
function renderExercises() { }
Creates a reusable function.

exerciseList.innerHTML = "";
Clears the HTML inside an element.

workout.exercises.forEach((exercise, exerciseIndex) => { })
Loops through each exercise.

const card = document.createElement("article");
Creates a new HTML element.

card.className = "exercise-card";
Gives the element a CSS class.

card.innerHTML = `...`;
Puts HTML inside the element.

${exercise.name}
Inserts a JavaScript value into the HTML string.

exercise.sets.map((set, setIndex) => `...`).join("")
Turns every set into an HTML row, then combines the rows into one big string.

set.done ? "checked" : ""
Means: if the set is done, make the checkbox checked.

exerciseList.appendChild(card);
Adds the card to the page.
*/

function updateSummary() {
  const totalExercises = workout.exercises.length;

  let totalSets = 0;
  let totalDone = 0;

  workout.exercises.forEach((exercise) => { // this loops through each of the exercises and updates the total number of sets
    totalSets += exercise.sets.length;

    exercise.sets.forEach((set) => {
      if (set.done) {
        totalDone += 1;
      }
    });
  });

  exerciseCount.textContent = totalExercises;
  setCount.textContent = totalSets;
  doneCount.textContent = totalDone;
}