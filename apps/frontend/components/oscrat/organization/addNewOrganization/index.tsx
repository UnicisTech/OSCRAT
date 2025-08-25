import React, { useState } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import {
  OscratOrganizationType,
  OscratOrganizationSize,
  TeamCreateRequest,
} from '@oscrat/model';
import CreateTeam from '@/components/auth/CreateTeam';

const OrganizationForm = ({ visible, setVisible }) => {
  const { t, ready } = useTranslation('common');
  const { createTeam, isLoading: isCreatingTeam } = useTeams();

  const [formData, setFormData] = useState({
    organizationType: 'natural',
    organizationName: '',
    taxId: '',
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

      // Build team creation data with defaults
      const teamData: TeamCreateRequest = {
        name: formData.organizationName.trim(),
        type: OscratOrganizationType.NATURAL_PERSON, // Default for now
        size: OscratOrganizationSize.STARTUP, // Default for now
        taxId: formData.taxId || undefined,
        postalAddress: formData.postalAddress || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        additionalInformation: formData.additionalInfo || undefined,
      };

      // Create the team/organization
      await createTeam(teamData);

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
      taxId: '',
      postalAddress: '',
      contactEmail: '',
      contactPhone: '',
      additionalInfo: '',
    });
    setVisible(false);
  };

  if (!ready) return null;
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
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

        <CreateTeam onClose={() => setVisible(false)} />
      </div>
    </div>
  );
};

export default OrganizationForm;
