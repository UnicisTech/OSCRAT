import React from 'react';

interface DividerProps {
  className?: string;
}

/**
 * Thin horizontal rule used between sections inside cards. Spacing is left to
 * the parent (cards space their children with a flex `gap`); pass `className`
 * for one-off margins.
 */
const Divider: React.FC<DividerProps> = ({ className = '' }) => (
  <hr className={`border-line-subtle w-full ${className}`} />
);

export default Divider;
