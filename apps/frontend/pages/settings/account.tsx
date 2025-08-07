import type { NextPageWithLayout } from 'types';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getSession } from '@/lib/session';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { UpdateAccount } from '@/components/account';
import env from '@/lib/env';

type AccountProps = inferSSRProps<typeof getServerSideProps>;

const Account: NextPageWithLayout<AccountProps> = ({
  user,
  allowEmailChange,
}) => {
  return <UpdateAccount user={user} allowEmailChange={allowEmailChange} />;
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
      user: {
        id: session.user.id,
        email: session.user.email || undefined,
        name: session.user.name || '',
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        image: session.user.image || null,
      },
      allowEmailChange: env.confirmEmail === false,
    },
  };
};

export default Account;
