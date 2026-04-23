import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const slug = context.params?.slug as string;
  return {
    redirect: {
      destination: slug ? `/organization/${slug}/dashboard` : '/organization',
      permanent: false,
    },
  };
}

export default function TeamIndex() {
  return null;
}
