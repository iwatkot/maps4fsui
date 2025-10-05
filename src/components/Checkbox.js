'use client';

import { useId } from 'react';

export default function Checkbox({ 
  label, 
  checked, 
  onChange, 
  size = "md",
  disabled = false,
  id = null,
  className = ""
}) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const getCheckboxSize = () => {
    switch(size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  const getIconSize = () => {
    switch(size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
          className="sr-only"
        />
        <div
          onClick={handleToggle}
          className={`
            relative flex items-center justify-center
            ${getCheckboxSize()}
            border-2 rounded-md transition-all duration-200 ease-in-out
            ${disabled 
              ? 'cursor-not-allowed border-gray-300 dark:border-gray-600 opacity-50' 
              : 'cursor-pointer border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
            }
            ${checked 
              ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-sm' 
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
          `}

        >
          {checked && (
            <i 
              className={`zmdi zmdi-check text-white ${getIconSize()}`}
            />
          )}
        </div>
      </div>
      <label 
        htmlFor={checkboxId}
        className={`
          flex-1 font-medium cursor-pointer select-none
          ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'}
          ${disabled 
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
            : 'text-gray-900 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
          }
        `}
      >
        {label}
      </label>
    </div>
  );
}