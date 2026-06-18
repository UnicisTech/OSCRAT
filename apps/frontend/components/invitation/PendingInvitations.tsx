import { Error, LetterAvatar, Loading } from '@/components/shared';
import { Invitation, Team } from '@oscrat/model';
import { useInvitations } from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/button';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { formatDateShort } from '@/utils/dateFormat';
const PendingInvitations = ({ team }: { team: Team }) => {
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);

  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { isLoading, isError, invitations, deleteInvitation } = useInvitations(
    team.slug
  );

  const { t } = useTranslation('common');

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={t('error-loading-invitations')} />;
  }

  const handleDeleteInvitation = async (invitation: Invitation | null) => {
    if (!invitation) return;
    try {
      await deleteInvitation(invitation.id);
      toast.success(t('invitation-deleted'));
      setConfirmationDialogVisible(false);
    } catch (error) {
      console.error(error);
      toast.error(t('error-deleting-invitation'));
    }
  };

  if (!invitations || !invitations.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <h2 className="text-xl font-medium leading-none tracking-tight">
          {t('pending-invitations')}
        </h2>
        <p className="text-content-muted text-sm">
          {t('description-invitations')}
        </p>
      </div>
      <table className="table w-full border-b text-sm">
        <thead className="bg-surface-muted text-content border-line-header border-b">
          <tr>
            <th className="text-b2 p-4 font-medium">{t('email')}</th>
            <th className="text-b2 p-4 font-medium">{t('role')}</th>
            <th className="text-b2 p-4 font-medium">{t('expires-at')}</th>
            <th className="text-b2 p-4 font-medium">{t('action')}</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invitation) => {
            return (
              <tr key={invitation.token}>
                <td>
                  <div className="flex items-center justify-start space-x-2">
                    <LetterAvatar name={invitation.email} />
                    <span>{invitation.email}</span>
                  </div>
                </td>
                <td>{invitation.role}</td>
                <td>{formatDateShort(invitation.expires)}</td>
                <td>
                  <Button
                    size="m"
                    tone="danger"
                    variant="secondary"
                    onClick={() => {
                      setSelectedInvitation(invitation);
                      setConfirmationDialogVisible(true);
                    }}
                  >
                    {t('remove')}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => handleDeleteInvitation(selectedInvitation)}
        title={t('confirm-delete-member-invitation')}
      >
        {t('delete-member-invitation-warning')}
      </ConfirmationDialog>
    </div>
  );
};

export default PendingInvitations;
