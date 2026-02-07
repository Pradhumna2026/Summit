import { startOfDay, addDays, differenceInDays, isAfter, isBefore, isSameDay } from 'date-fns';
import type { ActivityLog } from './store';

// Constant Expedition Parameters
export const EXPEDITION_START_DATE = new Date('2026-01-28T00:00:00');
export const SUMMIT_ELEVATION = 8848;
export const SUMMIT_STEPS_TARGET = 1450000;

// Elevation Thresholds (Matching Milestones)
export const HIGH_ALTITUDE_START = 2940; // Milestone 10
export const BASE_CAMP_START = 5364;      // Milestone 15

// Multipliers
export const REGIONAL_MULTIPLIERS = {
    LOW: 1,
    HIGH_ALT: 3,
    SUMMIT_PUSH: 4
};

/**
 * The base rate R (steps per meter) calculated to hit 1.45M steps at 8848m.
 * U = (2940 * 1) + (2424 * 3) + (3484 * 4) = 24148 units
 * R = 1,450,000 / 24148 ≈ 60.04638
 */
const TOTAL_UNITS = 24148;
const BASE_RATE_R = SUMMIT_STEPS_TARGET / TOTAL_UNITS;

/**
 * Calculates current elevation based on total steps using regional multipliers.
 */
export const stepsToElevation = (totalSteps: number): number => {
    const stepThreshold1 = HIGH_ALTITUDE_START * BASE_RATE_R;
    const stepThreshold2 = stepThreshold1 + (BASE_CAMP_START - HIGH_ALTITUDE_START) * REGIONAL_MULTIPLIERS.HIGH_ALT * BASE_RATE_R;

    let elevation = 0;

    if (totalSteps <= stepThreshold1) {
        elevation = totalSteps / BASE_RATE_R;
    } else if (totalSteps <= stepThreshold2) {
        elevation = HIGH_ALTITUDE_START + (totalSteps - stepThreshold1) / (BASE_RATE_R * REGIONAL_MULTIPLIERS.HIGH_ALT);
    } else {
        elevation = BASE_CAMP_START + (totalSteps - stepThreshold2) / (BASE_RATE_R * REGIONAL_MULTIPLIERS.SUMMIT_PUSH);
    }

    return Math.min(Math.floor(elevation), SUMMIT_ELEVATION);
};

/**
 * Calculates the current expedition week number (1-indexed).
 */
export const getExpeditionWeek = (date: Date): number => {
    const diffDays = differenceInDays(startOfDay(date), startOfDay(EXPEDITION_START_DATE));
    return Math.floor(diffDays / 7) + 1;
};

/**
 * Groups and sums steps into weekly totals.
 * Weeks transition every Wednesday.
 */
export const getWeeklyStats = (logs: ActivityLog[]) => {
    const now = new Date();

    // Find how many Wednesdays have passed since start
    const daysSinceStart = differenceInDays(startOfDay(now), startOfDay(EXPEDITION_START_DATE));
    const currentWeekStart = addDays(EXPEDITION_START_DATE, Math.floor(daysSinceStart / 7) * 7);
    const prevWeekStart = addDays(currentWeekStart, -7);

    const currentWeekSteps = logs
        .filter(l => {
            const d = new Date(l.date);
            return (isAfter(d, currentWeekStart) || isSameDay(d, currentWeekStart)) && isBefore(d, addDays(currentWeekStart, 7));
        })
        .reduce((sum, l) => sum + l.steps, 0);

    const prevWeekSteps = logs
        .filter(l => {
            const d = new Date(l.date);
            return (isAfter(d, prevWeekStart) || isSameDay(d, prevWeekStart)) && isBefore(d, currentWeekStart);
        })
        .reduce((sum, l) => sum + l.steps, 0);

    return {
        currentWeekSteps,
        prevWeekSteps,
        weekNumber: getExpeditionWeek(now)
    };
};
