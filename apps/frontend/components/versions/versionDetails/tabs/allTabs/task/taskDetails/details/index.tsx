import React, { useState, useEffect } from 'react';

// --- TYPE DEFINITIONS ---

interface TaskDetailsData {
  name: string;
  section: string;
  assignee: string;
  dateAdded: string;
  details: string;
  availableSections: string[];
  availableAssignees: string[];
}

// --- REUSABLE COMPONENTS ---

// TaskDetails Component
interface TaskDetailsProps {
  task: TaskDetailsData;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task }) => {
  const [name, setName] = useState(task.name);
  const [section, setSection] = useState(task.section);
  const [assignee, setAssignee] = useState(task.assignee);
  const [details, setDetails] = useState(task.details);

  // If the task prop changes from the parent, update the component's state.
  useEffect(() => {
    setName(task.name);
    setSection(task.section);
    setAssignee(task.assignee);
    setDetails(task.details);
  }, [task]);

  // Helper component for a form field with a label
  const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
  }) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <FormField label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          />
        </FormField>
        <FormField label="Section">
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          >
            {task.availableSections.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Assignee">
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          >
            {task.availableAssignees.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Date Added">
          <input
            type="text"
            value={task.dateAdded}
            readOnly
            className="w-full cursor-not-allowed rounded-md border border-gray-400 bg-gray-100 px-3 py-2 text-sm"
          />
        </FormField>
      </div>

      <FormField label="Details">
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          className="w-full whitespace-pre-wrap rounded-md border border-gray-400 px-3 py-2 text-sm"
        />
      </FormField>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function Index({ task }: { task: TaskDetailsData }) {
  return (
    <div className="flex w-full justify-center">
      <TaskDetails task={task} />
    </div>
  );
}
