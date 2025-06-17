/**
 * Get the authentication token from local storage
 * @returns The auth token or null if not found
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in local storage
 * @param token The token to store
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from local storage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Add type declarations
export type AuthToken = string | null; 