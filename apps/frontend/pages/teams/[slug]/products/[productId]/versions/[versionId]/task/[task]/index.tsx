import TaskDetails from '@/components/oscrat/versions/versionDetails/tabs/allTabs/task/taskDetails';
import { withProductDetailLayout } from '@/lib/layout-helpers';

export default function Index() {
  return <TaskDetails />;
}

Index.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
