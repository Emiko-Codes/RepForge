import { describe, expect, test } from "vitest";
import { summarizeWorkout } from "./summarizeworkout.js";

describe("summarizeWorkout", () => {
    test("counts all sets but gets the volume from the completed ones", () => { //test one to see if the calculations work
        const workout = {
            exercises: [
                {
                    sets: [
                        { weight: 100, reps: 5, done: true },
                        { weight: 60, reps: 8, done: false },
                    ],
                },
            ],
        };

        const summary = summarizeWorkout(workout);

        expect(summary).toEqual({
            exercises: 1,
            totalSets: 2,
            doneSets: 1,
            totalVolume: 500,
        });
    });

    test("returns zero totals when there are no exercises", () => {
        const summary = summarizeWorkout({ exercises: [] });

        expect(summary).toEqual({
            exercises: 0,
            totalSets: 0,
            doneSets: 0,
            totalVolume: 0,
        });
    });

    test("returns the amount of exercises", () => {
         
    });
});