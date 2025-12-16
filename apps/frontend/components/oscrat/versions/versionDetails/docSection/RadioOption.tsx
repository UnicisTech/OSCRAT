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
      className={`flex cursor-pointer ${descKey ? 'flex-col' : 'items-center'} rounded-lg border p-4 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-4 w-4 text-blue-600"
        />
        <span className={`ml-3 ${descKey ? 'font-medium' : ''} text-gray-900 dark:text-white`}>
          {t(labelKey)}
        </span>
      </div>
      {descKey && (
        <p className="ml-7 mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t(descKey)}
        </p>
      )}
    </label>
  );
}
