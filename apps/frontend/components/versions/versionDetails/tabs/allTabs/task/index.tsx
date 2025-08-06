import React, { useState, useMemo } from 'react';
import { FaRegEye } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import AddNewTaskModal from './modal';

// TODO: Wait for Radu to implement tasks
type TaskStatus = 'To do' | 'In Progress' | 'Done' | 'Blocked';

interface TaskData {
  id: string;
  name: string;
  dateAdded: string;
  section: string;
  assignee: string;
  status: TaskStatus;
}

interface NewTaskFormData {
  name: string;
  product: string;
  version: string;
  section: string;
  details: string;
}

interface TaskTableProps {
  tasks: TaskData[];
  onAddTask: () => void;
  onViewTask: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  statusOptions: TaskStatus[];
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onAddTask,
  onViewTask,
  onStatusChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
}) => {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  const tableHeaders = [
    'Name',
    'Dated Added',
    'Section',
    'Assignee',
    'Status',
    '',
  ];

  return (
    <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
      {/* Header with Filter and Add Button */}
      <div className="mb-4 flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-gray-900"
          >
            {t('status')}
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-md border border-gray-300 px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">{t('all')}</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onAddTask}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {t('oscrat.ui.add-task')}
        </button>
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-900">
          <thead className="bg-gray-200 text-xs uppercase text-gray-900">
            <tr>
              {tableHeaders.map((h) => (
                <th key={h} className="px-6 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t bg-white hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {task.name}
                </td>
                <td className="px-6 py-4">{task.dateAdded}</td>
                <td className="px-6 py-4">{task.section}</td>
                <td className="px-6 py-4">{task.assignee}</td>
                <td className="px-6 py-4">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      onStatusChange(task.id, e.target.value as TaskStatus)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onViewTask(task.id)}
                    className="flex items-center text-gray-900 hover:text-indigo-600"
                  >
                    <FaRegEye className="mr-2" /> {t('view')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function Index() {
  // --- MOCK DATA ---
  const allStatusOptions: TaskStatus[] = [
    'To do',
    'In Progress',
    'Done',
    'Blocked',
  ];

  const mockTasks: TaskData[] = [
    {
      id: 'task-1',
      name: 'MVSP - 1.1',
      dateAdded: '01.01.2025',
      section: 'Incidents',
      assignee: 'Anna Meier',
      status: 'To do',
    },
    {
      id: 'task-2',
      name: 'MVSP - 1.2',
      dateAdded: '01.01.2025',
      section: 'Vulnerabilities',
      assignee: 'Ravi Patel',
      status: 'To do',
    },
    {
      id: 'task-3',
      name: 'MVSP - 1.2',
      dateAdded: '01.01.2025',
      section: 'SBOM',
      assignee: 'Emily Carter',
      status: 'To do',
    },
    {
      id: 'task-4',
      name: 'MVSP - 2.1',
      dateAdded: '02.01.2025',
      section: 'Incidents',
      assignee: 'Anna Meier',
      status: 'In Progress',
    },
    {
      id: 'task-5',
      name: 'MVSP - 2.2',
      dateAdded: '03.01.2025',
      section: 'Vulnerabilities',
      assignee: 'Ravi Patel',
      status: 'Done',
    },
  ];

  // --- STATE ---
  const [tasks, setTasks] = useState<TaskData[]>(mockTasks);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial data for the new task form
  const initialTaskData: NewTaskFormData = useMemo(
    () => ({
      name: '',
      product: '',
      version: 'V2.3',
      section: 'Incidents',
      details: '',
    }),
    []
  );

  // --- HANDLERS ---
  const handleAddTask = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddNewTask = (taskData: NewTaskFormData) => {
    // Generate new task ID
    const newTaskId = `task-${Date.now()}`;

    // Create new task with current date
    const newTask: TaskData = {
      id: newTaskId,
      name: taskData.name,
      dateAdded: new Date().toLocaleDateString('en-GB'),
      section: taskData.section,
      assignee: 'Unassigned',
      status: 'To do',
    };

    // Add new task to the list
    setTasks((currentTasks) => [...currentTasks, newTask]);
    setIsModalOpen(false);
  };

  const handleViewTask = (id: string) => {
    alert(`View Task clicked for task: ${id}`);
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  // --- DERIVED STATE ---
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'All') {
      return tasks;
    }
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  return (
    <div className="flex w-full justify-center">
      <TaskTable
        tasks={filteredTasks}
        onAddTask={handleAddTask}
        onViewTask={handleViewTask}
        onStatusChange={handleStatusChange}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={allStatusOptions}
      />

      <AddNewTaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAddTask={handleAddNewTask}
        initialData={initialTaskData}
      />
    </div>
  );
}
