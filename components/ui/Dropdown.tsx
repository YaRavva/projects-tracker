import React, { useState } from 'react';

interface DropdownOption {
  name: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selected: string;
  onSelect: (option: DropdownOption) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-50">
      <div>
        <button
            type="button"
            className="glass-button inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            id="menu-button"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={() => setIsOpen(!isOpen)}
        >
          {selected}
          <svg className={`-mr-1 ml-2 h-4 w-4 ${isOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="#00ff9d" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
      {isOpen && (
          <ul
              className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md border-glass-border bg-[var(--cryptix-dark)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              style={{zIndex: 50}}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
          >
            {options.map((option, index) => {
              const isSelected = selected === option.name;
              const first = index === 0;
              const last = index === options.length - 1;
              return (
                  <li
                      key={index}
                      className={`cursor-pointer hover:bg-[rgba(0,255,157,0.1)] select-none text-white block px-4 py-2 text-sm ${isSelected ? 'shadow-glow-sm' : ''}
                  ${isSelected ? 'bg-[rgba(0,255,157,0.2)] text-[var(--cryptix-green)]' : ''}
                  ${first ? 'rounded-t-md' : ''}
                  ${last ? 'rounded-b-md' : ''}
                `}
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => handleOptionClick(option)}
                  >
                    {option.name}
                    {isSelected && (
                        <svg className="ml-2 h-4 w-4 inline-block" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                          />
                        </svg>
                    )}
                  </li>
              );
            })}
          </ul>
      )}
    </div>
  );
};

export default Dropdown;