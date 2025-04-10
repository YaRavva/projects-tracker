import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Находим текущий выбранный элемент
  const selectedOption = options.find(option => option.value === value) || options[0];

  const handleOptionClick = (option: { label: string; value: string | number }) => {
    onChange(option.value);
    setIsOpen(false);
  };

  // Закрываем дропдаун при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block text-left w-full z-[9999] ${className}`} ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="flex items-center justify-between w-full px-3 py-1 bg-glass-bg backdrop-blur-md border border-glass-border rounded-md text-gray-300 hover:border-cryptix-green/50 transition-colors focus:outline-none"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm">{selectedOption.label}</span>
          <svg
            className={`w-4 h-4 text-cryptix-green ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div
          className="dropdown-menu"
          style={{
            top: '100%',
            position: 'absolute',
            width: '100%',
            zIndex: 9999
          }}
          role="listbox"
          aria-orientation="vertical"
        >
          <div className="p-2 max-h-48 overflow-y-auto">
            {options.map((option, index) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={index}
                  className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleOptionClick(option)}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
