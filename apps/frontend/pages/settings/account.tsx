import type { NextPageWithLayout } from 'types';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import { getSession } from '@/lib/session';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { UpdateAccount } from '@/components/account';
import { useTeams } from 'hooks/useTeams';

type AccountProps = inferSSRProps<typeof getServerSideProps>;

const Account: NextPageWithLayout<AccountProps> = () => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const { teams } = useTeams();

  const user = {
    id: session?.user?.id,
    email: session?.user?.email || undefined,
    name: session?.user?.name || '',
    firstName: session?.user?.firstName || '',
    lastName: session?.user?.lastName || '',
    image: session?.user?.image || null,
  };

  // Settings is a global page with no team in scope, so resolve the dashboard
  // via the user's first team. Fall back to the org landing while teams load.
  const dashboardHref = teams[0]
    ? `/organization/${teams[0].slug}/dashboard`
    : '/organization';

  return (
    <div className="space-y-4">
      <Link
        href={dashboardHref}
        className="text-primary hover:text-info-emphasis inline-flex items-center text-sm font-medium"
      >
        {t('oscrat.ui.go-home')}
      </Link>
      <UpdateAccount user={user} />
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
    },
  };
};

export default Account;
