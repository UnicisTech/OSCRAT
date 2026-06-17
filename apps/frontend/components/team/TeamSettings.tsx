import { Card, InputWithLabel } from '@/components/shared';
import { Team } from '@oscrat/model';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import { useTeam } from '@/hooks/useTeam';
import { extractErrorMessage } from '@/lib/utils';
import { teamSettingsSchema } from '@/lib/validation/team';

import { AccessControl } from '../shared/AccessControl';

const TeamSettings = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { updateTeam, isLoading } = useTeam(team.slug);

  const formik = useFormik({
    initialValues: {
      name: team.name,
      slug: team.slug,
    },
    validationSchema: teamSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await updateTeam(values);

        toast.success(t('successfully-updated'));
        router.push(`/organization/${response.slug}/settings`);
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('an-error-occurred')));
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card>
          <Card.Body>
            <Card.Header>
              <Card.Title>{t('team-settings')}</Card.Title>
              <Card.Description>{t('team-settings-config')}</Card.Description>
            </Card.Header>
            <div className="flex flex-col gap-4">
              <InputWithLabel
                name="name"
                label={
                  <>
                    {t('team-name')}
                    <span className="ml-1 text-red-600">*</span>
                  </>
                }
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.errors.name ? t(formik.errors.name) : undefined}
                required
              />
              <InputWithLabel
                name="slug"
                label={
                  <>
                    {t('team-slug')}
                    <span className="ml-1 text-red-600">*</span>
                  </>
                }
                value={formik.values.slug}
                onChange={formik.handleChange}
                error={formik.errors.slug ? t(formik.errors.slug) : undefined}
                required
              />
            </div>
          </Card.Body>
          <AccessControl resource="team" actions={['update']}>
            <Card.Footer>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="primary"
                  loading={formik.isSubmitting || isLoading}
                  disabled={!formik.isValid || !formik.dirty}
                  size="md"
                >
                  {t('save-changes')}
                </Button>
              </div>
            </Card.Footer>
          </AccessControl>
        </Card>
      </form>
    </>
  );
};

export default TeamSettings;
