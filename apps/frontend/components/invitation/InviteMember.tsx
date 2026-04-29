import { availableRoles } from '@/lib/permissions';
import { extractErrorMessage } from '@/lib/utils';
import { Role, type Team } from '@oscrat/model';
import { useFormik } from 'formik';
import { useInvitations } from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button, Input } from 'react-daisyui';
import toast from 'react-hot-toast';
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
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header>{t('invite-new-member')}</Modal.Header>
        <Modal.Description>{t('invite-member-message')}</Modal.Description>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <Input
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              placeholder="email@unicis.tech"
              required
              className="input input-bordered bg-white text-black border-gray-300 placeholder-gray-500"
            />
            <select
              className="select select-bordered rounded bg-white text-black border-gray-300"
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
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
            size="md"
          >
            {t('close')}
          </Button>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting || isLoading}
            active={formik.dirty}
            size="md"
          >
            {t('send-invite')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default InviteMember;
