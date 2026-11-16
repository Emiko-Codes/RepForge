// We need to replicate the function that calculates the volume of an exercise based on the numnber of exercises and sets that have been done
// It is appropriate here because we are simply jus treplicating the function that we implemented already

export function summarizeWorkout(workout) {
    let totalSets = 0;
    let totalVolume = 0;
    let doneSets = 0;

    // define the loop that we will use to get to the number of sets => Workout <= Exercise <= Set
    for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
            totalSets++;
            if (set.done === true) {
                doneSets++;
                totalVolume += Number(set.weight) * Number(set.reps); // just in case the retrieved values are strings
            }
        }
    }

    // now we want to return the workout summary
    return {
        exercises: workout.exercises.length,
        totalSets,
        doneSets,
        totalVolume,
    };
}