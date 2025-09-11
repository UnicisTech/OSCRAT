/**
 * Slugify a string for use in filenames or URLs
 * Similar to frontend slugify but available for backend use
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w.-]+/g, '') // Remove all non-word chars except dots and dashes
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};
