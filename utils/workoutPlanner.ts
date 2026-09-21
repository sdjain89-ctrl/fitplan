import { getExerciseById } from "./exerciseDatabase";
import { Goal, WorkoutExercise, WorkoutPlanDay } from "./types";
import { WEEKDAYS } from "./dateUtils";

function toWorkoutExercises(ids: string[]): WorkoutExercise[] {
  return ids
    .map((id) => {
      const ex = getExerciseById(id);
      if (!ex) return null;
      return {
        exerciseId: ex.id,
        name: ex.name,
        sets: ex.defaultSets ?? 3,
        reps: ex.defaultReps ?? "10-12",
      };
    })
    .filter((e): e is WorkoutExercise => e !== null);
}

const TEMPLATES = {
  fullBodyA: toWorkoutExercises(["back-squat", "bench-press", "barbell-row", "ohp", "plank"]),
  fullBodyB: toWorkoutExercises(["romanian-deadlift", "incline-db-press", "pull-up", "lateral-raise", "cable-crunch"]),
  fullBodyC: toWorkoutExercises(["leg-press", "dips", "seated-cable-row", "barbell-curl", "hanging-leg-raise"]),
  upperA: toWorkoutExercises(["bench-press", "barbell-row", "ohp", "lat-pulldown", "barbell-curl", "triceps-pushdown"]),
  lowerA: toWorkoutExercises(["back-squat", "romanian-deadlift", "leg-press", "leg-curl", "calf-raise"]),
  upperB: toWorkoutExercises(["incline-db-press", "pull-up", "lateral-raise", "seated-cable-row", "hammer-curl", "skull-crusher"]),
  lowerB: toWorkoutExercises(["deadlift", "walking-lunge", "leg-press", "calf-raise", "hanging-leg-raise"]),
  push: toWorkoutExercises(["bench-press", "ohp", "incline-db-press", "lateral-raise", "dips", "triceps-pushdown"]),
  pull: toWorkoutExercises(["deadlift", "pull-up", "barbell-row", "seated-cable-row", "barbell-curl", "face-pull"]),
  legs: toWorkoutExercises(["back-squat", "romanian-deadlift", "leg-press", "walking-lunge", "leg-curl", "calf-raise"]),
};

type DaySpec = { focus: string; exercises: WorkoutExercise[] } | { focus: "Rest" };

function buildSchedule(daysPerWeek: number): DaySpec[] {
  const rest: DaySpec = { focus: "Rest" };
  switch (daysPerWeek) {
    case 3:
      return [
        { focus: "Full Body A", exercises: TEMPLATES.fullBodyA },
        rest,
        { focus: "Full Body B", exercises: TEMPLATES.fullBodyB },
        rest,
        { focus: "Full Body C", exercises: TEMPLATES.fullBodyC },
        rest,
        rest,
      ];
    case 4:
      return [
        { focus: "Upper Body A", exercises: TEMPLATES.upperA },
        { focus: "Lower Body A", exercises: TEMPLATES.lowerA },
        rest,
        { focus: "Upper Body B", exercises: TEMPLATES.upperB },
        { focus: "Lower Body B", exercises: TEMPLATES.lowerB },
        rest,
        rest,
      ];
    case 5:
      return [
        { focus: "Push", exercises: TEMPLATES.push },
        { focus: "Pull", exercises: TEMPLATES.pull },
        { focus: "Legs", exercises: TEMPLATES.legs },
        { focus: "Upper Body", exercises: TEMPLATES.upperB },
        { focus: "Lower Body", exercises: TEMPLATES.lowerB },
        rest,
        rest,
      ];
    case 6:
      return [
        { focus: "Push", exercises: TEMPLATES.push },
        { focus: "Pull", exercises: TEMPLATES.pull },
        { focus: "Legs", exercises: TEMPLATES.legs },
        { focus: "Push", exercises: TEMPLATES.push },
        { focus: "Pull", exercises: TEMPLATES.pull },
        { focus: "Legs", exercises: TEMPLATES.legs },
        rest,
      ];
    default:
      return [
        { focus: "Full Body A", exercises: TEMPLATES.fullBodyA },
        rest,
        { focus: "Full Body B", exercises: TEMPLATES.fullBodyB },
        rest,
        rest,
        rest,
        rest,
      ];
  }
}

/**
 * Training days follow a standard hypertrophy split (RIR 1-3, 6-15 rep range)
 * scaled by weekly frequency. Cardio is layered on rest days for cut/recomp
 * goals to support the fat-loss side of a recomposition without interfering
 * with lifting recovery.
 */
export function generateWorkoutPlan(daysPerWeek: number, goal: Goal): WorkoutPlanDay[] {
  const schedule = buildSchedule(daysPerWeek);
  const wantsCardio = goal === "recomp" || goal === "cut";
  let restCardioAssigned = 0;
  const maxRestCardio = goal === "cut" ? 3 : 2;

  return schedule.map((spec, i) => {
    const day = WEEKDAYS[i];
    if (!("exercises" in spec)) {
      const addCardio = wantsCardio && restCardioAssigned < maxRestCardio;
      if (addCardio) restCardioAssigned += 1;
      return {
        day,
        focus: addCardio ? "Active Recovery" : "Rest",
        exercises: [],
        cardioMin: addCardio ? 30 : undefined,
      };
    }
    return {
      day,
      focus: spec.focus,
      exercises: spec.exercises,
      cardioMin: wantsCardio ? 15 : undefined,
    };
  });
}

export function todaysWorkout(plan: WorkoutPlanDay[], weekday: string): WorkoutPlanDay | undefined {
  return plan.find((d) => d.day === weekday);
}
