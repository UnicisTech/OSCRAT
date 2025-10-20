export const reportStyles = {
  // Layout containers
  card: 'rounded-lg border border-gray-200 bg-white p-6',
  cardSection: 'space-y-6',

  // Headers
  pageTitle: 'text-2xl font-semibold text-gray-900',
  sectionTitle: 'mb-4 text-lg font-medium text-gray-900',
  sectionSubtitle: 'mt-1 text-sm text-gray-500',

  // Download button
  downloadButton: {
    base: 'inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm',
    enabled: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    disabled: 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400',
  },

  // Error state
  errorContainer: 'rounded-md bg-red-50 p-4',
  errorText: 'text-sm text-red-800',

  // Empty state
  emptyContainer: 'rounded-lg border border-gray-200 bg-white p-12 text-center',
  emptyText: 'text-gray-500',

  // Metadata grids
  metadataGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
  metadataGrid4: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
  metadataLabel: 'text-sm text-gray-500',
  metadataValue: 'mt-1 text-sm text-gray-900',
  metadataValueLarge: 'mt-1 text-2xl font-semibold text-gray-900',

  // Severity/Type grids
  severityGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5',
  typeGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4',
  typeCard: 'rounded-lg bg-gray-50 p-4',

  // Severity cards (with dynamic state)
  severityCard: {
    base: 'rounded-lg border-2 p-4',
    active: (color: 'red' | 'orange' | 'yellow' | 'blue' | 'gray') => {
      const colors = {
        red: 'border-red-200 bg-red-50',
        orange: 'border-orange-200 bg-orange-50',
        yellow: 'border-yellow-200 bg-yellow-50',
        blue: 'border-blue-200 bg-blue-50',
        gray: 'border-gray-200 bg-gray-50',
      };
      return colors[color];
    },
    inactive: 'border-gray-200 bg-gray-50',
  },

  severityLabel: {
    base: 'text-sm font-medium',
    active: (color: 'red' | 'orange' | 'yellow' | 'blue' | 'gray') => {
      const colors = {
        red: 'text-red-800',
        orange: 'text-orange-800',
        yellow: 'text-yellow-800',
        blue: 'text-blue-800',
        gray: 'text-gray-800',
      };
      return colors[color];
    },
    inactive: 'text-gray-500',
  },

  severityCount: {
    base: 'mt-1 text-2xl font-bold',
    active: (color: 'red' | 'orange' | 'yellow' | 'blue' | 'gray') => {
      const colors = {
        red: 'text-red-900',
        orange: 'text-orange-900',
        yellow: 'text-yellow-900',
        blue: 'text-blue-900',
        gray: 'text-gray-900',
      };
      return colors[color];
    },
    inactive: 'text-gray-600',
  },

  // Badge
  badge: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',

  // Table wrapper (combines with tableStyles)
  tableCard: 'rounded-lg border border-gray-200 bg-white',
  tableHeader: 'px-6 py-4',
};
