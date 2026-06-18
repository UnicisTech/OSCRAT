import type { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import React, { ReactElement } from 'react';
import { useTranslation } from 'next-i18next';
import jackson from '@/lib/jackson';
import InputWithCopyButton from '@/components/shared/InputWithCopyButton';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';

const SPConfig: NextPageWithLayout<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ config }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <div className="mt-10 flex w-full justify-center px-5">
        <div className="border-line-subtle bg-surface w-full rounded border p-6 md:w-1/2">
          <div className="flex flex-col space-y-3">
            <h2 className="text-content-secondary font-bold md:text-xl">
              {t('sp-saml-config-title')}
            </h2>
            <p className="text-content text-sm leading-6">
              {t('sp-saml-config-description')}
            </p>
            <p className="text-content-secondary text-sm leading-6">
              Refer to our&nbsp;
              <a
                href="https://boxyhq.com/docs/jackson/sso-providers"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                guides
              </a>
              &nbsp;for provider specific instructions.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-6">
            <div className="form-control w-full">
              <InputWithCopyButton
                value={config.acsUrl}
                label={t('sp-acs-url')}
              />
            </div>
            <div className="form-control w-full">
              <InputWithCopyButton
                value={config.entityId}
                label={t('sp-entity-id')}
              />
            </div>
            <div className="form-control w-full">
              <div className="flex flex-col">
                <label className="text-content mb-2 block text-sm font-medium">
                  {t('response')}
                </label>
                <p className="text-sm">{config.response}</p>
              </div>
            </div>
            <div className="form-control w-full">
              <div className="flex flex-col">
                <label className="text-content mb-2 block text-sm font-medium">
                  {t('assertion-signature')}
                </label>
                <p className="text-sm">{config.assertionSignature}</p>
              </div>
            </div>
            <div className="form-control w-full">
              <div className="flex flex-col">
                <label className="text-content mb-2 block text-sm font-medium">
                  {t('signature-algorithm')}
                </label>
                <p className="text-sm">{config.signatureAlgorithm}</p>
              </div>
            </div>
            <div className="form-control w-full">
              <div className="flex flex-col">
                <label className="text-content mb-2 block text-sm font-medium">
                  {t('assertion-encryption')}
                </label>
                <p className="text-sm">
                  If you want to encrypt the assertion, you can&nbsp;
                  <Link
                    href="/.well-known/saml.cer"
                    className="underline underline-offset-4"
                    target="_blank"
                  >
                    download our public certificate.
                  </Link>
                  &nbsp;Otherwise select the Unencrypted option.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

SPConfig.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export const getServerSideProps = async ({ locale }) => {
  const { spConfig } = await jackson();

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      config: await spConfig.get(),
    },
  };
};

export default SPConfig;
