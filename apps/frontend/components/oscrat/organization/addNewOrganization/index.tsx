import React, { useState } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import { InputField, TextareaField, RadioGroup } from './components';

const OrganizationForm = ({ visible, setVisible }) => {
  const { t, ready } = useTranslation('common');
  const { createTeam, isLoading: isCreatingTeam } = useTeams();

  const [formData, setFormData] = useState({
    organizationType: 'natural',
    organizationName: '',
    postalAddress: "45 Rue de l'Étoile, 75008, Paris, France",
    contactEmail: 'contact@abccompany',
    contactPhone: '123-4567-8901',
    additionalInfo: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.organizationName.trim()) {
      toast.error(t('oscrat.ui.organization-name-required'));
      return;
    }

    try {
      // Generate slug from organization name
      const slug = formData.organizationName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      // Create the team/organization
      await createTeam(formData.organizationName.trim(), slug);

      // Show success message
      toast.success(t('team-created'));

      // Reset form and close modal
      handleReset();
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.error-creating-team'))
      );
    }
  };

  const handleCancel = () => {
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      organizationType: 'natural',
      organizationName: '',
      postalAddress: '',
      contactEmail: '',
      contactPhone: '',
      additionalInfo: '',
    });
    setVisible(false);
  };

  if (!ready) return null;
  if (!visible) return null;

  // TODO: Change after its defined in DB
  const organizationTypeOptions = [
    {
      value: 'natural',
      label: t('oscrat.ui.natural-person'),
    },
    { value: 'legal', label: t('oscrat.ui.legal-person') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          disabled={isCreatingTeam}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('close')}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <h1 className="mb-6 text-xl font-semibold text-gray-900">
          {t('oscrat.ui.organization-information')}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            label={t('oscrat.ui.organization-type')}
            name="organizationType"
            options={organizationTypeOptions}
            selectedValue={formData.organizationType}
            onChange={handleChange}
          />

          <InputField
            id="organizationName"
            label={t('oscrat.ui.organization-name')}
            value={formData.organizationName}
            onChange={handleChange}
            placeholder={t('oscrat.ui.enter-organization-name')}
            required
          />

          <InputField
            id="postalAddress"
            label={t('oscrat.ui.postal-address')}
            value={formData.postalAddress}
            onChange={handleChange}
            placeholder={t('oscrat.ui.postal-address')}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              id="contactEmail"
              label={t('oscrat.ui.contact-email')}
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder={t('oscrat.ui.contact-email')}
            />
            <InputField
              id="contactPhone"
              label={t('oscrat.ui.contact-phone')}
              type="tel"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder={t('oscrat.ui.contact-phone')}
            />
          </div>

          <TextareaField
            id="additionalInfo"
            label={t('oscrat.ui.additional-info')}
            value={formData.additionalInfo}
            onChange={handleChange}
            placeholder={t('oscrat.ui.type-here')}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-start space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCreatingTeam}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isCreatingTeam || !formData.organizationName.trim()}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingTeam
                ? t('oscrat.ui.creating')
                : t('oscrat.ui.create-organization')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationForm;
