export const reportStyles = {
  // Layout containers
  card: 'rounded-card border border-line-subtle bg-surface p-6',
  cardSection: 'space-y-6',

  // Headers
  pageTitle: 'text-2xl font-semibold text-content',
  sectionTitle: 'mb-4 text-lg font-medium text-content',
  sectionSubtitle: 'mt-1 text-sm text-content-muted',

  // Download button
  downloadButton: {
    base: 'inline-flex items-center rounded-input border px-4 py-2 text-sm font-medium shadow-2',
    enabled:
      'border-line bg-surface text-content-secondary hover:bg-surface-muted',
    disabled:
      'cursor-not-allowed border-line-subtle bg-surface-muted text-content-placeholder',
  },

  // Error state
  errorContainer: 'rounded-card bg-danger-subtle p-4',
  errorText: 'text-sm text-danger-emphasis',

  // Empty state
  emptyContainer:
    'rounded-card border border-line-subtle bg-surface p-12 text-center',
  emptyText: 'text-content-muted',

  // Metadata grids
  metadataGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
  metadataGrid4: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
  metadataLabel: 'text-sm text-content-muted',
  metadataValue: 'mt-1 text-sm text-content',
  metadataValueLarge: 'mt-1 text-2xl font-semibold text-content',

  // Severity/Type grids
  severityGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5',
  typeGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4',
  typeCard: 'rounded-card bg-surface-muted p-4',

  // Severity cards (with dynamic state)
  severityCard: {
    base: 'rounded-card border-2 p-4',
    active: (color: 'red' | 'orange' | 'yellow' | 'blue' | 'gray') => {
      const colors = {
        red: 'border-danger-border bg-danger-subtle',
        orange: 'border-warning bg-warning-subtle',
        yellow: 'border-caution bg-caution-subtle',
        blue: 'border-info bg-info-subtle',
        gray: 'border-line-subtle bg-surface-muted',
      };
      return colors[color];
    },
    inactive: 'border-line-subtle bg-surface-muted',
  },

  severityLabel: {
    base: 'text-sm font-medium',
    active: (color: 'red' | 'orange' | 'yellow' | 'blue' | 'gray') => {
      const colors = {
        red: 'text-danger-emphasis',
        orange: 'text-warning-emphasis',
        yellow: 'text-caution-emphasis',
        blue: 'text-info-emphasis',
        gray: 'text-content',
      };
      return colors[color];
    },
    inactive: 'text-content-muted',
  },

  severityCount: {
    base: 'mt-1 text-2xl font-bold',
    active: (color: 'red' | 'orange' | 'yellow' | 'blue' | 'gray') => {
      const colors = {
        red: 'text-danger-emphasis',
        orange: 'text-warning-emphasis',
        yellow: 'text-caution-emphasis',
        blue: 'text-info-emphasis',
        gray: 'text-content',
      };
      return colors[color];
    },
    inactive: 'text-content-secondary',
  },

  // Badge
  badge:
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',

  // Table wrapper (combines with tableStyles)
  tableCard: 'rounded-card border border-line-subtle bg-surface',
  tableHeader: 'px-6 py-4',
};
