import { availableRoles } from '@/lib/permissions';
import { extractErrorMessage } from '@/lib/utils';
import { Role, type Team } from '@oscrat/model';
import { useFormik } from 'formik';
import { useInvitations } from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/button';
import Modal from '../shared/Modal';
import { inviteMemberSchema } from '@/lib/validation/team';

const InviteMember = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { createInvitation, isLoading } = useInvitations(team.slug);
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      email: '',
      role: availableRoles[0].id,
    },
    validationSchema: inviteMemberSchema,
    onSubmit: async (values) => {
      try {
        await createInvitation(values.email, values.role);
        toast.success(t('invitation-sent'));
        setVisible(false);
        formik.resetForm();
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('error-sending-invitation')));
      }
    },
  });
  const toggleVisible = () => {
    setVisible(!visible);
  };

  return (
    <Modal open={visible} close={toggleVisible}>
      <form onSubmit={formik.handleSubmit} method="POST" className="contents">
        <Modal.Header>{t('invite-new-member')}</Modal.Header>
        <Modal.Description>{t('invite-member-message')}</Modal.Description>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="text-content mb-2 block text-sm font-medium"
              >
                {t('email')}
                <span className="text-danger ml-1">*</span>
              </label>
              <input
                id="email"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                placeholder="email@unicis.tech"
                required
                className="border-line text-content-secondary placeholder-content-placeholder focus:border-primary focus:ring-primary rounded-input w-full border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2"
              />
            </div>
            <select
              className="select select-bordered bg-surface border-line text-content rounded"
              name="role"
              onChange={formik.handleChange}
              required
              defaultValue={Role.MEMBER}
            >
              {availableRoles.map((role) => (
                <option value={role.id} key={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t('close')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={formik.isSubmitting || isLoading}
          >
            {t('send-invite')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default InviteMember;
