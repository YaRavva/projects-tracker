import React from 'react';

interface SimpleDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'ДД.ММ.ГГГГ',
  className = '',
  id,
  name,
  required = false
}) => {
  // Форматирование даты для отображения
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Отображаемая дата
  const displayDate = value ? formatDate(value) : '';

  return (
    <div className="relative">
      <div className={`w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus-within:ring-2 focus-within:ring-cryptix-green/30 hover:border-cryptix-green/50 transition-colors flex justify-between items-center ${className}`}>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          id={id}
          name={name}
          required={required}
        />
        <span className="text-sm text-white">
          {displayDate || placeholder}
        </span>
        <svg
          className="w-5 h-5 text-cryptix-green flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
};

export default SimpleDatePicker;
