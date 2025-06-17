/**
 * Get the authentication token from local storage
 */
export declare function getAuthToken(): string | null;

/**
 * Set the authentication token in local storage
 */
export declare function setAuthToken(token: string): void;

/**
 * Remove the authentication token from local storage
 */
export declare function removeAuthToken(): void;

/**
 * Check if the user is authenticated
 */
export declare function isAuthenticated(): boolean;

/**
 * Auth token type
 */
export type AuthToken = string | null; 