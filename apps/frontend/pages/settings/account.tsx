import type { NextPageWithLayout } from 'types';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import { getSession } from '@/lib/session';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { UpdateAccount } from '@/components/account';
import env from '@/lib/env';

type AccountProps = inferSSRProps<typeof getServerSideProps>;

const Account: NextPageWithLayout<AccountProps> = ({
  allowEmailChange,
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');

  const user = {
    id: session?.user?.id,
    email: session?.user?.email || undefined,
    name: session?.user?.name || '',
    firstName: session?.user?.firstName || '',
    lastName: session?.user?.lastName || '',
    image: session?.user?.image || null,
  };

  return (
    <div className="space-y-4">
      <Link
        href="/organization"
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        {t('oscrat.ui.go-home')}
      </Link>
      <UpdateAccount user={user} allowEmailChange={allowEmailChange} />
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const { locale } = context;

  if (!session?.user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      allowEmailChange: env.confirmEmail === false,
    },
  };
};

export default Account;
