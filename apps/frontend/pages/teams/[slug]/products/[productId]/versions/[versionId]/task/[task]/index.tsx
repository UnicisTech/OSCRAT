import { useRouter } from 'next/router';
import TaskDetails from '@/components/oscrat/versions/versionDetails/tabs/allTabs/task/taskDetails';
import { withProductDetailLayout } from '@/lib/layout-helpers';

export default function Index() {
  const router = useRouter();
  const { task: taskParam } = router.query;
  const taskNumber = taskParam as string;

  return <TaskDetails taskNumber={taskNumber} />;
}

Index.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
