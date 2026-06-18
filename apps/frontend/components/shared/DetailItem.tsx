import React from 'react';

type DetailItemVariant = 'default' | 'large';

const VARIANT_STYLES: Record<
  DetailItemVariant,
  { label: string; value: string }
> = {
  default: {
    label: 'mb-1 text-xs text-content-muted',
    value: 'text-sm font-semibold text-content',
  },
  large: {
    label: 'mb-1 text-sm text-content-secondary',
    value: 'text-xl font-bold text-content',
  },
};

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  variant?: DetailItemVariant;
}

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  variant = 'default',
}) => {
  const styles = VARIANT_STYLES[variant];

  return (
    <div>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};

export default DetailItem;
