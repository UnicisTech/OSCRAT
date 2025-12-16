/**
 * Shared form styles for Declaration of Conformity templates
 */
export const docFormStyles = {
  input:
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
  inputReadOnly:
    'w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300',
  label: 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300',
  textarea:
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
  sectionTitle: 'font-semibold text-gray-900 dark:text-white',
  sectionContainer: 'space-y-3',
} as const;
