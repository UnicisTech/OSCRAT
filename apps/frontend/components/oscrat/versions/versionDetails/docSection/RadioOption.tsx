import { useTranslation } from 'next-i18next';

interface RadioOptionProps<T extends string> {
  name: string;
  value: T;
  labelKey: string;
  descKey?: string;
  selected: T;
  onChange: (value: T) => void;
}

/**
 * Radio option component for wizard steps.
 * Supports optional description text below the label.
 */
export default function RadioOption<T extends string>({
  name,
  value,
  labelKey,
  descKey,
  selected,
  onChange,
}: RadioOptionProps<T>) {
  const { t } = useTranslation('common');
  const isSelected = selected === value;

  return (
    <label
      className={`flex cursor-pointer ${descKey ? 'flex-col' : 'items-center'} rounded-card border p-4 ${
        isSelected
          ? 'border-info bg-info-subtle'
          : 'border-line-subtle hover:bg-surface-muted'
      }`}
    >
      <div className="flex items-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          onChange={(e) => onChange(e.target.value as T)}
          className="text-primary h-4 w-4"
        />
        <span className={`ml-3 ${descKey ? 'font-medium' : ''} text-content`}>
          {t(labelKey)}
        </span>
      </div>
      {descKey && (
        <p className="text-content-muted ml-7 mt-1 text-sm">{t(descKey)}</p>
      )}
    </label>
  );
}
