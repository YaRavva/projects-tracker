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
  placeholder = 'ДД.ММ.ГГГГ',
  className = '',
  id,
  name,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Кастомный инпут для календаря
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <button
        type="button"
        className={`w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 text-left flex justify-between items-center ${className}`}
        onClick={onClick}
        ref={ref}
      >
        <span>{value || placeholder}</span>
        <svg 
          className="w-5 h-5 text-cryptix-green" 
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
      </button>
    )
  );

  // Форматирование даты в формат дд.мм.гг
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="relative">
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        customInput={<CustomInput />}
        dateFormat="dd.MM.yyyy"
        locale={ru}
        popperPlacement="bottom-end"
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 5],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              rootBoundary: 'viewport',
              tether: false,
              altAxis: true,
            },
          },
        ]}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        className="react-datepicker-cryptix"
        calendarClassName="bg-cryptix-darker border-glass-border rounded-md shadow-lg"
        dayClassName={date => 
          date.getDate() === new Date().getDate() && 
          date.getMonth() === new Date().getMonth() && 
          date.getFullYear() === new Date().getFullYear()
            ? 'react-datepicker__day--today'
            : undefined
        }
        id={id}
        name={name}
        required={required}
        showPopperArrow={false}
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
