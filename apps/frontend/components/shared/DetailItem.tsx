import React from 'react';

type DetailItemVariant = 'default' | 'large';

const VARIANT_STYLES: Record<DetailItemVariant, { label: string; value: string }> = {
  default: {
    label: 'mb-1 text-xs text-gray-500',
    value: 'text-sm font-semibold text-gray-800',
  },
  large: {
    label: 'mb-1 text-sm text-gray-600',
    value: 'text-xl font-bold text-gray-800',
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
