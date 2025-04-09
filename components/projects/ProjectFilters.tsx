import React, { useState } from 'react';

interface ProjectFiltersProps {
  initialFilters?: {
    search: string;
    status: string;
    sortBy: string;
  };
  onFilterChange: (filters: {
    search: string;
    status: string;
    sortBy: string;
  }) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ initialFilters, onFilterChange }) => {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [status, setStatus] = useState(initialFilters?.status || 'all');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'newest');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onFilterChange({ search: value, status, sortBy });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    onFilterChange({ search, status: value, sortBy });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    onFilterChange({ search, status, sortBy: value });
  };

  return (
    <div className="glass-card mb-6">
      <div className="glass-card-body">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">
              Поиск
            </label>
            <input
              type="text"
              id="search"
              placeholder="Название проекта..."
              className="glass-input w-full px-3 h-10 bg-cryptix-darker border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 focus:border-cryptix-green/50"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
              Статус
            </label>
            <select
              id="status"
              className="w-full px-3 h-10 bg-cryptix-darker border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 focus:border-cryptix-green/50"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="all">Все проекты</option>
              <option value="active">Активные</option>
              <option value="pending">На рассмотрении</option>
              <option value="returned">Возвращены</option>
              <option value="rejected">Отклонены</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-300 mb-1">
              Сортировка
            </label>
            <select
              id="sortBy"
              className="w-full px-3 h-10 bg-cryptix-darker border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 focus:border-cryptix-green/50"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="deadline">По дедлайну</option>
              <option value="name">По названию</option>
              <option value="progress">По прогрессу</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;