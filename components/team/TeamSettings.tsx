import { Card, InputWithLabel } from '@/components/shared';
import { domainRegex } from '@/lib/common';
import { Team } from '@prisma/client';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useTeam } from '@/hooks/useTeam';
import { extractErrorMessage } from '@/lib/utils';

import { AccessControl } from '../shared/AccessControl';

const TeamSettings = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { updateTeam, isLoading } = useTeam(team.slug);

  const formik = useFormik({
    initialValues: {
      name: team.name,
      slug: team.slug,
      domain: team.domain,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Name is required'),
      slug: Yup.string().required('Slug is required'),
      domain: Yup.string().nullable().matches(domainRegex, {
        message: 'Invalid domain: ${value}',
      }),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await updateTeam({
          ...values,
          domain: values.domain || undefined,
        });

        toast.success(t('successfully-updated'));
        router.push(`/teams/${response.slug}/settings`);
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
                label={t('team-name')}
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.errors.name}
              />
              <InputWithLabel
                name="slug"
                label={t('team-slug')}
                value={formik.values.slug}
                onChange={formik.handleChange}
                error={formik.errors.slug}
              />
              <InputWithLabel
                name="domain"
                label={t('team-domain')}
                value={formik.values.domain ? formik.values.domain : ''}
                onChange={formik.handleChange}
                error={formik.errors.domain}
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
