import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(_context: GetServerSidePropsContext) {
  return {
    redirect: {
      destination: '/teams',
      permanent: false,
    },
  };
}

export default function TeamIndex() {
  return null;
}
