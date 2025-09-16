import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task, Team } from '@oscrat/model';
import TaskListFilters from './TaskListFilters';
import TaskListTable from './TaskListTable';
import TaskStatusDropdown from './TaskStatusDropdown';

interface TaskListProps {
  tasks: Task[];
  team: Team;
  isLoading?: boolean;
}

interface FilterState {
  status: string;
  product: string;
}

// Mock product data - replace with actual product data when available
const mockProducts = [
  { value: 'product-1', label: 'Product Alpha' },
  { value: 'product-2', label: 'Product Beta' },
  { value: 'product-3', label: 'Product Gamma' },
];

const TaskList: React.FC<TaskListProps> = ({ tasks, team, isLoading = false }) => {
  const { t, ready } = useTranslation('common');
  
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    product: '',
  });


  const handleFilterChange = (filterType: keyof FilterState) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: e.target.value,
    }));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = !filters.status || task.status === filters.status;
      // For now, assuming all tasks match product filter since we don't have product data
      const matchesProduct = !filters.product || true;
      
      return matchesStatus && matchesProduct;
    });
  }, [tasks, filters]);

  const clearFilters = () => {
    setFilters({
      status: '',
      product: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">{t('loading-project-details')}</div>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        {/* Filters Section */}
        <TaskListFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          mockProducts={mockProducts}
        />

        {/* Table Section */}
        <TaskListTable
          tasks={filteredTasks.length === 0 && tasks.length > 0 ? [] : filteredTasks}
          team={team}
          statusDropdown={TaskStatusDropdown}
        />
      </div>
    </div>
  );
};

export default TaskList;