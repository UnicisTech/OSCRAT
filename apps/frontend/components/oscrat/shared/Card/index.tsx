import React, { ElementType, HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Element to render as — defaults to `div`. */
  as?: ElementType;
  className?: string;
}

/**
 * Surface chrome shared by the product / version cards: subtle border, white
 * surface, 8px radius and the standard 24/16 padding. Internal layout (flex,
 * grid, gaps) stays with the consumer via `className`.
 */
const Card: React.FC<CardProps> = ({
  children,
  as: Tag = 'div',
  className = '',
  ...rest
}) => (
  <Tag
    className={`border-line bg-surface rounded-card border px-6 py-4 ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
