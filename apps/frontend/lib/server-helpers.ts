import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

/**
 * Common getServerSideProps for pages that only need basic translations
 */
export async function getCommonServerSideProps(
  context: GetServerSidePropsContext,
  additionalNamespaces: string[] = []
) {
  const { locale } = context;
  const namespaces = ['common', ...additionalNamespaces];

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, namespaces) : {}),
    },
  };
}
