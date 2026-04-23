import Form from '@/components/oscrat/form';
import { useTeamContext } from '@/context/TeamContext';

export default function Index() {
  const { slug } = useTeamContext();
  return <Form teamSlug={slug} />;
}
