/**
 * This file contains the logic for the user leveling system.
 */

export const levelThresholds = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    1000,   // Level 5 (Rising Star)
    2000,   // Level 6
    3500,   // Level 7
    5000,   // Level 8
    7500,   // Level 9
    10000,  // Level 10 (Level Up)
    12500,  // Level 11
    15000,  // Level 12
    17500,  // Level 13
    20000,  // Level 14
    22500,  // Level 15 (High Achiever)
    25000,  // Level 16
    27500,  // Level 17
    30000,  // Level 18
    32500,  // Level 19
    35000   // Level 20 (Level Pro)
];

/**
 * Calculates the total XP required to reach a specific level.
 * @param level The target level.
 * @returns The total accumulated XP needed to reach that level.
 */
export const getTotalXpForLevel = (level: number): number => {
    if (level <= 1) {
        return 0;
    }
    if (level > levelThresholds.length) {
        return levelThresholds[levelThresholds.length - 1];
    }
    return levelThresholds[level - 1];
};

/**
 * Calculates the amount of XP needed to advance from the current level
 * to the next one.
 * @param level The user's current level.
 * @returns The amount of XP required to level up.
 */
export const getXpToLevelUp = (level: number): number => {
    if (level >= levelThresholds.length) {
        return 0; // Max level reached
    }
    const xpForNextLevel = levelThresholds[level];
    const xpForCurrentLevel = getTotalXpForLevel(level);
    return xpForNextLevel - xpForCurrentLevel;
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
    const level = levelThresholds.filter(threshold => xp >= threshold).length;
    return level > 0 ? level : 1;
}; 