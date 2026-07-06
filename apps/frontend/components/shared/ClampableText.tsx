import { FC, useState } from 'react';
import { useTranslation } from 'next-i18next';

interface Props {
  text?: string | null;
  placeholder?: string;
  className?: string;
  /**
   * If the trimmed text length exceeds this threshold the component clamps
   * to `line-clamp-6` and renders a Show more/less toggle. Kept as a plain
   * character count (rather than DOM measurement) because it is precise
   * enough for the details-page fields where this is used and avoids the
   * layout thrashing of measuring after every render.
   */
  toggleThreshold?: number;
}

const ClampableText: FC<Props> = ({
  text,
  placeholder = '-',
  className = '',
  toggleThreshold = 240,
}) => {
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState(false);

  const trimmed = text?.trim();

  if (!trimmed) {
    return <p className={className}>{placeholder}</p>;
  }

  const shouldOfferToggle = trimmed.length > toggleThreshold;
  const clampClass = shouldOfferToggle && !expanded ? 'line-clamp-6' : '';

  return (
    <div>
      <p
        className={
          `whitespace-pre-wrap break-words ${clampClass} ${className}`.trim()
        }
      >
        {trimmed}
      </p>
      {shouldOfferToggle && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-primary mt-1 text-sm font-medium hover:underline"
        >
          {t(expanded ? 'oscrat.ui.show-less' : 'oscrat.ui.show-more')}
        </button>
      )}
    </div>
  );
};

export default ClampableText;
