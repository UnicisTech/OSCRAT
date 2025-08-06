import TaskDetails from '@/components/oscrat/versions/versionDetails/tabs/allTabs/task/taskDetails';
import { withProductLayout } from '@/lib/layout-helpers';

export default function Index() {
  return <TaskDetails />;
}

Index.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
