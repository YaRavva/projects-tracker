import React, { useState } from 'react';
import Dropdown from '../ui/Dropdown';

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

  const statusOptions = [
    { name: 'Все проекты', value: 'all' },
    { name: 'Активные', value: 'active' },
    { name: 'На рассмотрении', value: 'pending' },
    { name: 'Возвращены', value: 'returned' },
    { name: 'Отклонены', value: 'rejected' },
    { name: 'Завершены', value: 'completed' },
  ];

  const sortOptions = [
    { name: 'Сначала новые', value: 'newest' },
    { name: 'Сначала старые', value: 'oldest' },
    { name: 'По дедлайну', value: 'deadline' },
    { name: 'По названию', value: 'name' },
    { name: 'По прогрессу', value: 'progress' },
  ];

  const getSelectedOption = (options: { name: string; value: string; }[], value: string) => {
    return options.find(option => option.value === value)?.name || '';
  };


  return (
    <div className="glass-card mb-6 relative z-20">
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
          <div className="relative" style={{ zIndex: 9999 }}>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
              Статус
            </label>
            <Dropdown
              options={statusOptions}
              selected={getSelectedOption(statusOptions, status)}
              onSelect={(option) => {
                const selectedStatus = option.value || option.name;
                setStatus(selectedStatus);
                onFilterChange({ search, status: selectedStatus, sortBy });
              }}
            />
          </div>

          <div className="relative" style={{ zIndex: 9998 }}>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-300 mb-1">
              Сортировка
            </label>
            <Dropdown
              options={sortOptions}
              selected={getSelectedOption(sortOptions, sortBy)}
              onSelect={(option) => {
                const selectedSort = option.value || option.name;
                setSortBy(selectedSort);
                onFilterChange({ search, status, sortBy: selectedSort });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};



export default ProjectFilters;