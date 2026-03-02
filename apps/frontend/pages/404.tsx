import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loading } from '@/components/shared';
import type { NextPageWithLayout } from 'types';

const Custom404: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return <Loading />;
};

export default Custom404;
