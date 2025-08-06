import React, { useState, useEffect } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

interface NewTaskFormData {
  name: string;
  product: string;
  version: string;
  section: string;
  details: string;
}

interface AddNewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: NewTaskFormData) => void;
  initialData: NewTaskFormData;
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}
    </label>
    {children}
  </div>
);

const AddNewTaskModal: React.FC<AddNewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  initialData,
}) => {
  const { t, ready } = useTranslation();
  if (!ready) return null;

  const [taskData, setTaskData] = useState<NewTaskFormData>(() => initialData);
  const versionOptions = ['V2.3', 'V2.2', 'V2.1'];
  const sectionOptions = ['Incidents', 'Vulnerabilities', 'SBOM'];

  // Only reset form when modal opens, not when initialData changes
  useEffect(() => {
    if (isOpen) {
      setTaskData({
        name: '',
        product: '',
        version: 'V2.3',
        section: 'Incidents',
        details: '',
      });
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof NewTaskFormData, value: string) => {
    setTaskData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(taskData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            {t('oscrat.ui.add-new-task')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoClose size={24} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <main className="space-y-4 overflow-y-auto p-6">
            <FormField label="Name">
              <input
                type="text"
                value={taskData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </FormField>
            <FormField label="Product">
              <div className="relative">
                <input
                  type="text"
                  value={taskData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                />
                <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </FormField>
            <FormField label="Version">
              <select
                value={taskData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {versionOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Section">
              <select
                value={taskData.section}
                onChange={(e) => handleInputChange('section', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {sectionOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Details">
              <textarea
                value={taskData.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
                rows={4}
                className="w-full whitespace-pre-wrap rounded-md border border-gray-300 px-3 py-2"
              />
            </FormField>
          </main>
          <footer className="flex items-center justify-end space-x-3 border-t bg-gray-50 p-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="rounded-md border-transparent bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              {t('add')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddNewTaskModal;
