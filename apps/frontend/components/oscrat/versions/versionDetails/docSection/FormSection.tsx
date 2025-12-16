import { docFormStyles } from '@/lib/doc/formStyles';

interface FormFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  multiline = false,
  rows = 3,
}: FormFieldProps) {
  const inputClasses = readOnly ? docFormStyles.inputReadOnly : docFormStyles.input;

  return (
    <div>
      <label className={docFormStyles.label}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          className={readOnly ? docFormStyles.inputReadOnly : docFormStyles.textarea}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          className={inputClasses}
        />
      )}
    </div>
  );
}

interface FormSectionProps {
  number?: string;
  title: string;
  children: React.ReactNode;
}

export function FormSection({ number, title, children }: FormSectionProps) {
  return (
    <div className={docFormStyles.sectionContainer}>
      <h4 className={docFormStyles.sectionTitle}>
        {number && `${number}. `}
        {title}
      </h4>
      {children}
    </div>
  );
}
