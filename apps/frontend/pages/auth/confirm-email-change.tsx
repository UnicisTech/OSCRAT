import {
  getEmailChangeByToken,
  isEmailChangeExpired,
  confirmEmailChange,
} from 'models/emailChange';
import { isPrismaUniqueConstraintError } from '@/lib/errors';
import type { GetServerSidePropsContext } from 'next';
import type { ReactElement } from 'react';

const ConfirmEmailChange = () => {
  return <></>;
};

ConfirmEmailChange.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext) => {
  const { token } = query as { token: string };

  if (!token) {
    return {
      notFound: true,
    };
  }

  const emailChange = await getEmailChangeByToken(token);

  if (!emailChange) {
    return {
      redirect: {
        destination: '/auth/login?error=token-not-found',
        permanent: false,
      },
    };
  }

  if (isEmailChangeExpired(emailChange)) {
    return {
      redirect: {
        destination: '/auth/login?error=verify-account-expired',
        permanent: false,
      },
    };
  }

  try {
    await confirmEmailChange({
      token,
      userId: emailChange.userId,
      newEmail: emailChange.newEmail,
    });
  } catch (error) {
    // The address was claimed by another account since the link was issued —
    // the unique constraint on User.email rejects the swap.
    if (isPrismaUniqueConstraintError(error)) {
      return {
        redirect: {
          destination: '/auth/login?error=account-exists',
          permanent: false,
        },
      };
    }
    throw error;
  }

  // The session still carries the old address; send the user to sign in again.
  return {
    redirect: {
      destination: '/auth/login?success=email-changed',
      permanent: false,
    },
  };
};

export default ConfirmEmailChange;
