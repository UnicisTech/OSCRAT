/**
 * Format a date to a long format, EU day-first ordering (e.g., "15 January 2024")
 */
export const formatDateLong = (date?: Date | string): string => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date to the standard EU short format DD.MM.YYYY (e.g., "15.01.2024").
 * Used across the app's tables/lists so every date display is consistent.
 */
export const formatDateShort = (date?: Date | string): string => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(dateObj.getTime())) return '-';

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}.${month}.${year}`;
};

/**
 * Format a date with time, EU conventions (e.g., "15 January 2024, 15:30")
 */
export const formatDateTime = (
  date?: Date | string,
  includeSeconds = false
): string => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...(includeSeconds && { second: '2-digit' }),
  });
};

/**
 * Returns current date as YYYY-MM-DD string
 */
export const getCurrentStringDate = (): string => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
