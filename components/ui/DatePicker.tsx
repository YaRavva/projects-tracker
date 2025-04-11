import React, { forwardRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';
import CustomSelect from './CustomSelect';

// Массив месяцев на русском языке
const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
];

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
  // Используем useState для отслеживания состояния открытия/закрытия календаря
  const [, setIsOpen] = useState(false);

  // Логируем выбранную дату при рендере
  console.log('CustomDatePicker rendering with selectedDate:', selectedDate, 'id:', id, 'name:', name);

  // Кастомный инпут для календаря
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => {
      console.log('CustomInput rendering with value:', value);
      return (
      <button
        type="button"
        className={`w-full px-3 py-2 bg-glass-bg backdrop-blur-md border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 flex justify-between items-center hover:border-cryptix-green/50 transition-colors ${className}`}
        onClick={onClick}
        ref={ref}
        style={{ paddingRight: '70px' }} /* Добавляем отступ справа для иконок */
      >
        <span className="text-sm text-gray-300">{value || placeholder}</span>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ right: '8px' }}>
          <svg
            className="w-5 h-5 text-cryptix-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 0 2px rgba(0, 255, 157, 0.5))' }}
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
    // Создаем копию даты и устанавливаем время на полдень, чтобы избежать проблем с часовым поясом
    const dateCopy = new Date(date);
    dateCopy.setHours(12, 0, 0, 0);

    const formatted = dateCopy.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    console.log('Formatted date:', formatted);
    return formatted;
  };

  return (
    <div className="relative z-[9999]" style={{ position: 'relative' }}>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          console.log('DatePicker onChange called with date:', date, 'for', id || 'unknown');

          // Если дата выбрана, устанавливаем время на полдень, чтобы избежать проблем с часовым поясом
          if (date) {
            const adjustedDate = new Date(date);
            adjustedDate.setHours(12, 0, 0, 0);
            onChange(adjustedDate);
          } else {
            onChange(null);
          }
        }}
        customInput={<CustomInput />}
        dateFormat="dd.MM.yy"
        locale={ru}

        popperClassName="datepicker-popper"
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
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
        portalId="root"
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled
        }) => (
          <div className="flex items-center justify-between px-2 py-2">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
              className="flex items-center justify-center p-1 rounded-full hover:bg-cryptix-green/10 transition-colors"
              style={{ filter: prevMonthButtonDisabled ? 'opacity(0.5)' : 'none' }}
            >
              <svg className="w-5 h-5 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center space-x-2 flex-1 px-2">
              <div className="w-2/5">
                <CustomSelect
                  options={Array.from({ length: 20 }, (_, i) => {
                    const year = date.getFullYear() - 5 + i;
                    return { label: year.toString(), value: year };
                  })}
                  value={date.getFullYear()}
                  onChange={(value) => changeYear(Number(value))}
                />
              </div>

              <div className="w-3/5">
                <CustomSelect
                  options={MONTHS.map((month, index) => ({
                    label: month,
                    value: index
                  }))}
                  value={date.getMonth()}
                  onChange={(value) => changeMonth(Number(value))}
                />
              </div>
            </div>

            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              type="button"
              className="flex items-center justify-center p-1 rounded-full hover:bg-cryptix-green/10 transition-colors"
              style={{ filter: nextMonthButtonDisabled ? 'opacity(0.5)' : 'none' }}
            >
              <svg className="w-5 h-5 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
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
