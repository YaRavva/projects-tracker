import React, { forwardRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';

interface CustomDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selectedDate,
  onChange,
  placeholder = 'дд.мм.гг',
  className = '',
  id,
  name,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Логируем выбранную дату при рендере
  console.log('CustomDatePicker rendering with selectedDate:', selectedDate, 'id:', id, 'name:', name);

  // Кастомный инпут для календаря
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => {
      console.log('CustomInput rendering with value:', value);
      return (
      <button
        type="button"
        className={`w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 flex justify-between items-center hover:border-cryptix-green/50 transition-colors ${className}`}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', paddingRight: '60px' }}
        onClick={onClick}
        ref={ref}
      >
        <span className="text-sm">{value || placeholder}</span>
        <div className="calendar-icon-wrapper flex-shrink-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', minHeight: '20px' }}>
          <svg
            className="w-5 h-5 text-cryptix-green calendar-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '20px', height: '20px', minWidth: '20px', color: 'var(--cryptix-green)', filter: 'drop-shadow(0 0 2px rgba(0, 255, 157, 0.5))' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </button>
      );
    }
  );

  // Форматирование даты в формат дд.мм.гг
  const formatDate = (date: Date): string => {
    console.log('formatDate called with date:', date);
    const formatted = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    console.log('Formatted date:', formatted);
    return formatted;
  };

  return (
    <div className="relative">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          console.log('DatePicker onChange called with date:', date, 'for', id || 'unknown');
          onChange(date);
        }}
        customInput={<CustomInput />}
        dateFormat="dd.MM.yy"
        locale={ru}
        // Удаляем popperModifiers, так как он вызывает ошибки типизации

        popperContainer={({ children }) => (
          <div className="datepicker-popper-container">{children}</div>
        )}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        className="react-datepicker-cryptix"
        calendarClassName="bg-cryptix-darker border-glass-border rounded-md shadow-lg"
        // Удаляем dayClassName, так как он вызывает ошибки типизации
        id={id}
        name={name}
        required={required}
        showPopperArrow={false}
        monthsShown={1}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        fixedHeight
        todayButton="Сегодня"
        isClearable
        // Добавляем класс для иконки очистки
        clearButtonClassName="datepicker-clear-button"
      />
      <input
        type="hidden"
        name={name}
        value={selectedDate ? formatDate(selectedDate) : ''}
        required={required}
      />
    </div>
  );
};

export default CustomDatePicker;
