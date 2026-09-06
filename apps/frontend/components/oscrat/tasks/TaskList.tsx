import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task, Team, OscratProductSearchResult } from '@oscrat/model';
import TaskListFilters from './TaskListFilters';
import TaskListTable from './TaskListTable';
import TaskStatusDropdown from './TaskStatusDropdown';
import PaginationControls from '@/components/shared/PaginationControls';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

interface TaskListProps {
  tasks: Task[];
  team: Team;
  products: OscratProductSearchResult[];
  isLoading?: boolean;
}

interface FilterState {
  status: string[];
  taskType: string[];
  productId: string[];
  versionId: string[];
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  team,
  products,
  isLoading = false,
}) => {
  const { t, ready } = useTranslation('common');

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    taskType: [],
    productId: [],
    versionId: [],
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique products from tasks and enrich with names from products prop
  const productOptions = useMemo(() => {
    const productMap = new Map<string, { value: string; label: string }>();

    if (products) {
      tasks.forEach((task) => {
        if (task.productId && !productMap.has(task.productId)) {
          const product = products.find((p) => p.id === task.productId);
          if (product) {
            productMap.set(task.productId, {
              value: task.productId,
              label: product.name,
            });
          }
        }
      });
    }

    return Array.from(productMap.values());
  }, [tasks, products]);

  // Extract unique versions from tasks and enrich with version names
  const versionOptions = useMemo(() => {
    const versionMap = new Map<string, { value: string; label: string }>();

    tasks.forEach((task) => {
      const matchesProduct =
        filters.productId.length === 0 ||
        (task.productId && filters.productId.includes(task.productId));

      if (task.versionId && matchesProduct && !versionMap.has(task.versionId)) {
        const product = products?.find((p) => p.id === task.productId);
        const version = product?.versions?.find((v) => v.id === task.versionId);
        if (version) {
          versionMap.set(version.id, {
            value: version.id,
            label: version.version,
          });
        }
      }
    });

    return Array.from(versionMap.values());
  }, [tasks, products, filters.productId]);

  const handleFilterToggle = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[filterType];
      const isSelected = currentValues.includes(value);

      const updated = {
        ...prev,
        [filterType]: isSelected
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      };

      // If product filter changes, remove versions that don't belong to any selected products
      if (filterType === 'productId' && prev.versionId.length > 0) {
        updated.versionId = prev.versionId.filter((versionId) =>
          tasks.some(
            (task) =>
              updated.productId.includes(task.productId!) &&
              task.versionId === versionId
          )
        );
      }

      return updated;
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesStatus =
          filters.status.length === 0 || filters.status.includes(task.status);
        const matchesType =
          filters.taskType.length === 0 ||
          filters.taskType.includes(task.taskType);
        const matchesProduct =
          filters.productId.length === 0 ||
          (task.productId && filters.productId.includes(task.productId));
        const matchesVersion =
          filters.versionId.length === 0 ||
          (task.versionId && filters.versionId.includes(task.versionId));

        return matchesStatus && matchesType && matchesProduct && matchesVersion;
      })
      .sort((a, b) => b.taskNumber - a.taskNumber);
  }, [tasks, filters]);

  const totalPages = Math.ceil(filteredTasks.length / LISTING_PAGE_SIZE);
  const safeTotalPages = Math.max(totalPages, 1);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * LISTING_PAGE_SIZE;
    return filteredTasks.slice(startIndex, startIndex + LISTING_PAGE_SIZE);
  }, [filteredTasks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, safeTotalPages));
  }, [safeTotalPages]);

  const clearFilters = () => {
    setFilters({
      status: [],
      taskType: [],
      productId: [],
      versionId: [],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-content-muted">{t('loading-project-details')}</div>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div className="border-line bg-surface rounded-card border p-6">
      <div className="space-y-4">
        {/* Filters Section */}
        <TaskListFilters
          filters={filters}
          onFilterToggle={handleFilterToggle}
          onClearFilters={clearFilters}
          products={productOptions}
          versions={versionOptions}
        />

        {/* Table Section */}
        <TaskListTable
          tasks={
            paginatedTasks.length === 0 && tasks.length > 0
              ? []
              : paginatedTasks
          }
          team={team}
          statusDropdown={TaskStatusDropdown}
        />

        {/* Pagination */}
        {filteredTasks.length > LISTING_PAGE_SIZE && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={safeTotalPages}
            prevButtonDisabled={currentPage === 1}
            nextButtonDisabled={currentPage === safeTotalPages}
            goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
            goToNextPage={() =>
              setCurrentPage((p) => Math.min(safeTotalPages, p + 1))
            }
            showItemCount
            totalItems={filteredTasks.length}
            itemsPerPage={LISTING_PAGE_SIZE}
          />
        )}
      </div>
    </div>
  );
};

export default TaskList;
