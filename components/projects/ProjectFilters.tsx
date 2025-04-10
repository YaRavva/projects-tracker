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
    <div className="flex flex-wrap items-center gap-4 relative z-50">
      <div className="relative w-64">
        <input
          type="text"
          id="search"
          placeholder="Поиск проектов..."
          className="glass-input w-full px-3 h-9 bg-cryptix-darker border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 focus:border-cryptix-green/50 text-sm"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      <div className="relative w-48" style={{ zIndex: 99999 }}>
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

      <div className="relative w-48" style={{ zIndex: 99998 }}>
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
  );
};



export default ProjectFilters;