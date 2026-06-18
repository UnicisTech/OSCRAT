import React, { useState, useRef } from 'react';
import { IoCloudUpload } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fileDescriptionSchema } from '@/lib/validation/inputs';
import Button from '@/components/button';
import Modal from '@/components/shared/Modal';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFile: (file: File, description?: string) => void;
}

const fileFormSchema = Yup.object({
  description: fileDescriptionSchema.optional(),
});

const AddFileModal: React.FC<AddFileModalProps> = ({
  isOpen,
  onClose,
  onAddFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { t, ready } = useTranslation('common');

  const formik = useFormik({
    initialValues: { description: '' },
    validationSchema: fileFormSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      if (!selectedFile) {
        alert(t('please-select-file-to-upload'));
        return;
      }
      onAddFile(selectedFile, values.description.trim() || undefined);
      handleClose();
    },
  });

  const handleClose = () => {
    setSelectedFile(null);
    formik.resetForm();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (!ready) return null;

  return (
    <Modal open={isOpen} close={handleClose} size="md">
      <Modal.Header>{t('oscrat.ui.add-new-file')}</Modal.Header>
      <form onSubmit={formik.handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="text-content-secondary mb-1 block text-sm font-medium">
                {t('oscrat.ui.upload-file')}
                <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <label
                  htmlFor="fileUpload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`focus:border-primary focus:ring-primary rounded-card flex w-full cursor-pointer items-center justify-center border-2 border-dashed px-4 py-6 text-center focus:outline-none focus:ring-2 ${
                    isDragOver
                      ? 'border-info bg-info-subtle'
                      : 'border-line hover:border-line'
                  }`}
                >
                  <div className="space-y-2">
                    <IoCloudUpload className="text-content-placeholder mx-auto h-8 w-8" />
                    <div className="text-content-secondary text-sm">
                      {selectedFile ? (
                        <span className="text-primary font-medium">
                          {selectedFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-primary font-medium">
                            {t('click-to-upload')}
                          </span>{' '}
                          <span className="text-content-muted">
                            {t('oscrat.ui.or-drag-and-drop')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-content-secondary mb-1 block text-sm font-medium"
              >
                {t('description')} ({t('optional')})
              </label>
              <textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border-line shadow-2 focus:border-primary focus:ring-primary rounded-input w-full border px-3 py-2 focus:outline-none"
                placeholder={t('oscrat.ui.file-description-placeholder')}
                rows={3}
                maxLength={200}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-danger mt-1 text-sm">
                  {t(formik.errors.description)}
                </p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('oscrat.ui.add-file')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddFileModal;
