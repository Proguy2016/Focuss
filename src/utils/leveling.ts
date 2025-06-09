/**
 * This file contains the logic for the user leveling system.
 */

/**
 * The base XP required to level up. The XP required for each level
 * is a multiple of this value.
 */
const BASE_XP = 50;

/**
 * Calculates the total XP required to reach a specific level.
 * @param level The target level.
 * @returns The total accumulated XP needed to reach that level.
 */
export const getTotalXpForLevel = (level: number): number => {
    if (level <= 1) {
        return 0;
    }
    // This is the sum of an arithmetic series: 50*1 + 50*2 + ... + 50*(level-1)
    return (25 * level * (level - 1));
};

/**
 * Calculates the amount of XP needed to advance from the current level
 * to the next one.
 * @param level The user's current level.
 * @returns The amount of XP required to level up.
 */
export const getXpToLevelUp = (level: number): number => {
    return level * BASE_XP;
};

/**
 * Determines a user's level based on their total accumulated XP.
 * @param xp The user's total XP.
 * @returns The user's calculated level.
 */
export const getLevelFromXp = (xp: number): number => {
    if (xp <= 0) {
        return 1;
    }
    // Derived from solving the quadratic equation for the total XP formula.
    const level = Math.floor(0.5 * (1 + Math.sqrt(1 + (xp * 4) / BASE_XP)));
    return level;
}; 