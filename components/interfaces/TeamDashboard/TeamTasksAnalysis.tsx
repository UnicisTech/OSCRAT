import { useTranslation } from 'next-i18next';
import PieChart from '../CSC/PieChart';
import { TaskStatusesDetail } from '@/components/interfaces/CSC';
import { useTeamContext } from '@/context/TeamContext';
import { useTeamTasks } from 'hooks/useTeamTasks';

const labels = ["To Do", "In Progress", "In Review", "Feedback", "Done"];

const barColors = [
  "rgb(232, 232, 232)", // todo
  "rgb(123, 146, 178)", // in progress
  "rgb(77, 110, 255)", // in review
  "rgb(0, 181, 255)", // feedback
  "rgb(0, 169, 110)", // done
];

const TasksAnalysis = () => {
  const { t } = useTranslation('translation');
  const { slug } = useTeamContext();
  const { tasks } = useTeamTasks(slug);

  const statuses: { [key: string]: string } =
    tasks?.reduce((acc: { [key: string]: string }, task) => {
      if (task.status && !acc[task.status.toLowerCase()]) {
        acc[task.id] = getStatusName(task.status);
      }
      return acc;
    }, {}) || {};

  const statusCounts: { [key: string]: number } =
    tasks?.reduce((acc: { [key: string]: number }, task) => {
      if (task.status) {
        const statusKey = task.status.toLowerCase();
        acc[statusKey] = (acc[statusKey] || 0) + 1;
      }
      return acc;
    }, {}) || {};

  return (
    <>
      {/* Team Tasks Analysis */}
      <div className="mx-4 mb-2 flex items-center justify-between">
        <h4>{t(`${slug?.toString().toUpperCase()} Task Overview`)}</h4>
      </div>
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md p-2">
        <div
          style={{
            height: "400px",
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "10px",
          }}
        >
          <div
            style={{ width: "49%" }}
            className="stats stat-value bg-white py-2 shadow dark:bg-base-100"
          >
            <PieChart
              page_name={`task`}
              statuses={statuses}
              barColor={barColors}
              labels={labels}
            />
          </div>
          <div style={{ width: "49%" }} className="p-4 shadow">
            <TaskStatusesDetail tasks={tasks} statusCounts={statusCounts} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TasksAnalysis;

function getStatusName(statusId: string): string {
  switch (statusId.toLowerCase()) {
    case "todo":
      return "To Do";
    case "inprogress":
      return "In Progress";
    case "inreview":
      return "In Review";
    case "feedback":
      return "Feedback";
    case "done":
      return "Done";
    default:
      return statusId;
  }
}
