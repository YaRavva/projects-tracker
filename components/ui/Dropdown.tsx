import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  name: string;
  value?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selected: string;
  onSelect: (option: DropdownOption) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: DropdownOption) => {
    onSelect(option);
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
    <div className="relative inline-block text-left w-full z-[9999]" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="flex items-center justify-between w-full px-3 py-2 bg-glass-bg backdrop-blur-md border border-glass-border rounded-md text-gray-300 hover:border-cryptix-green/50 transition-colors focus:outline-none"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selected}</span>
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
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="p-2">
            {options.map((option, index) => {
              const isSelected = selected === option.name;
              return (
                <button
                  key={index}
                  className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  role="menuitem"
                  onClick={() => handleOptionClick(option)}
                >
                  <span>{option.name}</span>
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

export default Dropdown;