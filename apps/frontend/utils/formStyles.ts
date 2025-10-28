/**
 * Common form input styles utility
 * Provides reusable className strings for consistent form styling
 */

export const formStyles = {
  input: {
    base: 'mt-1 w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:text-gray-200',
    normal: 'border-gray-300 dark:border-gray-600',
    error: 'border-red-500',
    disabled: 'mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300',
  },
  textarea: {
    base: 'mt-1 w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:text-gray-200',
    normal: 'border-gray-300 dark:border-gray-600',
    error: 'border-red-500',
  },
  select: {
    base: 'mt-1 w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:text-gray-200',
    normal: 'border-gray-300 dark:border-gray-600',
    error: 'border-red-500',
  },
  label: {
    default: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
  },
  error: {
    text: 'mt-1 text-sm text-red-600 dark:text-red-400',
  },
} as const;

/**
 * Helper to generate input class names based on state
 */
export const getInputClassName = (hasError: boolean, disabled?: boolean): string => {
  if (disabled) {
    return formStyles.input.disabled;
  }
  
  const classes: string[] = [formStyles.input.base];
  classes.push(hasError ? formStyles.input.error : formStyles.input.normal);
  return classes.join(' ');
};

/**
 * Helper to generate textarea class names based on state
 */
export const getTextareaClassName = (hasError: boolean): string => {
  const classes: string[] = [formStyles.textarea.base];
  classes.push(hasError ? formStyles.textarea.error : formStyles.textarea.normal);
  return classes.join(' ');
};

/**
 * Helper to generate select class names based on state
 */
export const getSelectClassName = (hasError: boolean): string => {
  const classes: string[] = [formStyles.select.base];
  classes.push(hasError ? formStyles.select.error : formStyles.select.normal);
  return classes.join(' ');
};

