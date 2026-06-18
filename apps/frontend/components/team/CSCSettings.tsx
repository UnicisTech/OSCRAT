import { Card } from '@/components/shared';
import { Team } from '@oscrat/model';
import { isoOptions } from '../defaultLanding/data/configs/csc';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Button from '@/components/button';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useSetCscIso, useGetCscIso } from '@/lib/api/hooks/csc';
import { extractErrorMessage } from '@/lib/utils';

const CSCSettings = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const { mutateAsync: setIso, isPending: isLoading } = useSetCscIso(team.slug);
  const { data: currentIso } = useGetCscIso(team.slug);

  const formik = useFormik({
    initialValues: {
      iso: currentIso || 'default',
    },
    validationSchema: Yup.object().shape({
      iso: Yup.string().required('Choose ISO set'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await setIso(values.iso);
        toast.success(t('successfully-updated'));
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('an-error-occurred')));
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card heading={t('csc-settings')}>
          <Card.Body className="px-3 py-3">
            <div className="mt-2 flex flex-col space-y-4">
              <p>{t('csc-choose-iso')}</p>
              <div className="flex w-1/2 items-center justify-between space-x-3">
                <select
                  className="select select-bordered bg-surface flex-grow"
                  name="iso"
                  onChange={formik.handleChange}
                  value={formik.values.iso}
                  required
                >
                  {isoOptions.map((option, index) => {
                    return (
                      <option value={option.value} key={index}>
                        {option.label}
                      </option>
                    );
                  })}
                </select>
                <Button
                  type="submit"
                  variant="primary"
                  loading={formik.isSubmitting || isLoading}
                  disabled={!formik.isValid || !formik.dirty}
                >
                  {t('choose')}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </form>
    </>
  );
};

export default CSCSettings;
