import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <div>
    <label className="text-content-secondary mb-1 block text-sm font-medium">
      {label}
    </label>
    {children}
  </div>
);

export default FormField;
