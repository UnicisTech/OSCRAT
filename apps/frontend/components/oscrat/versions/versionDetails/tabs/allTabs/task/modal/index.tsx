import React, { useState, useEffect } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import FormField from '@/components/shared/FormField';
import Button from '@/components/button';
import Modal from '@/components/shared/Modal';

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

const AddNewTaskModal: React.FC<AddNewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  initialData,
}) => {
  const { t, ready } = useTranslation();

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

  if (!ready) return null;

  return (
    <Modal open={isOpen} close={onClose} size="md">
      <Modal.Header>{t('oscrat.ui.add-new-task')}</Modal.Header>
      <form onSubmit={handleSubmit} className="contents">
        <Modal.Body>
          <FormField label="Name">
            <input
              type="text"
              value={taskData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="border-line rounded-input w-full border px-3 py-2"
            />
          </FormField>
          <FormField label="Product">
            <div className="relative">
              <input
                type="text"
                value={taskData.product}
                onChange={(e) => handleInputChange('product', e.target.value)}
                className="border-line rounded-input w-full border px-3 py-2 pr-10"
              />
              <IoSearch className="text-content-placeholder absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </FormField>
          <FormField label="Version">
            <select
              value={taskData.version}
              onChange={(e) => handleInputChange('version', e.target.value)}
              className="border-line rounded-input w-full border px-3 py-2"
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
              className="border-line rounded-input w-full border px-3 py-2"
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
              className="border-line rounded-input w-full whitespace-pre-wrap border px-3 py-2"
            />
          </FormField>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            text={t('cancel')}
          />
          <Button type="submit" variant="primary" text={t('add')} />
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddNewTaskModal;
