import { InputHTMLAttributes } from 'react';

import CopyToClipboardButton from './CopyToClipboardButton';

interface InputWithCopyButtonProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

const InputWithCopyButton = (props: InputWithCopyButtonProps) => {
  const { label, value, description, className = '', ...rest } = props;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <label className="text-content-secondary block text-sm font-medium">
          {label}
        </label>
        <CopyToClipboardButton value={value?.toString() || ''} />
      </div>
      <input
        className={`border-line text-content-secondary placeholder-content-placeholder focus:border-primary focus:ring-primary rounded-input w-full border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 ${className}`}
        {...rest}
        defaultValue={value}
      />
      {description && (
        <p className="text-content-secondary mt-1 text-sm">{description}</p>
      )}
    </div>
  );
};

export default InputWithCopyButton;
