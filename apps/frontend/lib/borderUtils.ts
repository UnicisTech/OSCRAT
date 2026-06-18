/**
 * Utility function for styling borders based on status conditions
 */

/**
 * Returns border class based on count - red if count > 0, gray if 0
 * @param count - Number of items
 * @returns Tailwind border class string
 */
export const getBorderClass = (count: number): string => {
  return count > 0 ? 'border-danger' : 'border-line';
};
