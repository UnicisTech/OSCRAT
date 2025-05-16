import { useFormik } from 'formik';
import { useTeams } from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import Modal from '../shared/Modal';
import { InputWithLabel } from '../shared';
import { extractErrorMessage } from '@/lib/utils';

interface CreateTeamProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const CreateTeam = ({ visible, setVisible }: CreateTeamProps) => {
  const { t } = useTranslation('common');
  const { createTeam } = useTeams();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      try {
        const result = await createTeam(
          values.name,
          values.name.toLowerCase().replace(/\s+/g, '-')
        );
        formik.resetForm();
        setVisible(false);
        toast.success(t('team-created'));
        router.push(`/teams/${result.slug}/settings`);
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('error-creating-team')));
      }
    },
  });

  return (
    <Modal open={visible} close={() => setVisible(false)}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header>{t("create-team")}</Modal.Header>
        <Modal.Description>{t("members-of-a-team")}</Modal.Description>
        <Modal.Body>
          <InputWithLabel
            label={t("name")}
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
            placeholder={t("team-name")}
            required
          />
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
            {t("close")}
          </Button>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            size="md"
            disabled={!formik.dirty || !formik.isValid}
          >
            {t("create-team")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateTeam;
