import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

/**
 * Canonical app button — implements the Figma "M_Button" system and is the
 * single button primitive for the app (replaces the old daisyUI / AtlasKit /
 * bespoke buttons).
 *
 *   variant: primary (solid) · secondary (outlined) · tertiary (text)
 *   tone:    default (indigo/neutral, per Figma) · danger (destructive)
 *   size:    s (24px) · m (32px) · l (40px) · xl (48px)
 *
 * States (default / hover / active / disabled / focus) come from the
 * `button-*` (and `danger-*` for the danger tone) design tokens in
 * tailwind.config.js. Icons inherit the label colour via `currentColor`.
 *
 * Pass `icon` (with no children/text) for a square icon-only button; otherwise
 * use `startIcon` / `endIcon` alongside the label. `loading` shows a spinner
 * and disables the button.
 *
 * Note: `tone="danger"` and `loading` extend the Figma button frame (which
 * only specs neutral, static buttons) to cover real app needs — both reuse
 * existing semantic tokens rather than introducing new design values.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonTone = 'default' | 'danger';
export type ButtonSize = 's' | 'm' | 'l' | 'xl';

type ButtonProps = {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Convenience label; equivalent to passing the text as children. */
  text?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Render a square icon-only button (ignored when children/text present). */
  icon?: ReactNode;
  fullWidth?: boolean;
  /** Show a spinner and disable the button. */
  loading?: boolean;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  'inline-flex items-center justify-center rounded-input font-medium select-none ' +
  'transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-white disabled:cursor-not-allowed';

// variant × tone → interactive state classes.
const toneStyles: Record<ButtonTone, Record<ButtonVariant, string>> = {
  default: {
    primary:
      'bg-button-primary text-content-inverse hover:bg-button-primary-hover ' +
      'active:bg-button-primary-active disabled:bg-button-primary-disabled disabled:text-content-inverse',
    secondary:
      'bg-transparent text-content border border-line hover:bg-button-overlay ' +
      'active:bg-button-overlay-active disabled:bg-transparent disabled:text-content-placeholder',
    tertiary:
      'bg-transparent text-content-secondary hover:bg-button-overlay ' +
      'active:bg-button-overlay-active disabled:bg-transparent disabled:text-content-placeholder',
  },
  danger: {
    primary:
      'bg-danger text-content-inverse hover:bg-danger-hover active:bg-danger-emphasis ' +
      'disabled:bg-button-primary-disabled disabled:text-content-inverse',
    secondary:
      'bg-transparent text-danger border border-danger-border hover:bg-danger-subtle ' +
      'active:bg-danger-subtle disabled:bg-transparent disabled:border-line disabled:text-content-placeholder',
    tertiary:
      'bg-transparent text-danger hover:bg-danger-subtle active:bg-danger-subtle ' +
      'disabled:bg-transparent disabled:text-content-placeholder',
  },
};

const ringTone: Record<ButtonTone, string> = {
  default: 'focus-visible:ring-primary',
  danger: 'focus-visible:ring-danger',
};

// Text-button sizing: horizontal/vertical padding + gap + label type ramp.
const sizeStyles: Record<ButtonSize, string> = {
  s: 'px-2 py-1 gap-1.5 text-c1',
  m: 'px-3 py-1 gap-2 text-b2',
  l: 'px-4 py-2 gap-2 text-b2',
  xl: 'px-4 py-3 gap-2 text-b2',
};

// Icon-only sizing: square padding so the box matches the text-button height.
const iconSizeStyles: Record<ButtonSize, string> = {
  s: 'p-1',
  m: 'p-1.5',
  l: 'p-2',
  xl: 'p-3',
};

// Glyph dimensions per size (16 / 20 / 24).
const glyphSize: Record<ButtonSize, string> = {
  s: 'h-4 w-4',
  m: 'h-5 w-5',
  l: 'h-6 w-6',
  xl: 'h-6 w-6',
};

function Glyph({ size, children }: { size: ButtonSize; children: ReactNode }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${glyphSize[size]} [&>svg]:h-full [&>svg]:w-full`}
    >
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="h-full w-full animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    tone = 'default',
    size = 'l',
    text,
    startIcon,
    endIcon,
    icon,
    fullWidth = false,
    loading = false,
    className = '',
    children,
    type = 'button',
    disabled,
    ...rest
  },
  ref
) {
  const label = children ?? text;
  const iconOnly = icon != null && label == null;

  const classes = [
    base,
    toneStyles[tone][variant],
    ringTone[tone],
    iconOnly ? iconSizeStyles[size] : sizeStyles[size],
    fullWidth && 'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {iconOnly ? (
        <Glyph size={size}>{loading ? <Spinner /> : icon}</Glyph>
      ) : (
        <>
          {loading ? (
            <Glyph size={size}>
              <Spinner />
            </Glyph>
          ) : (
            startIcon && <Glyph size={size}>{startIcon}</Glyph>
          )}
          {label}
          {endIcon && <Glyph size={size}>{endIcon}</Glyph>}
        </>
      )}
    </button>
  );
});

export default Button;
