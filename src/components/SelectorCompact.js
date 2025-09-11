'use client';

import { useState } from 'react';

export default function SelectorCompact({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue, option) => {
    if (option.disabled) return;
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setIsOpen(false)}
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors text-sm font-medium min-w-[140px]"
      >
        <span className="text-gray-900 dark:text-gray-100">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Options Panel */}
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value, option)}
                disabled={option.disabled}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                  value === option.value 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                    : option.disabled 
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'text-gray-900 dark:text-gray-100'
                } ${option.disabled ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                <span className="text-sm font-medium">
                  {option.label}
                </span>
                
                {option.disabled && (
                  <span className="text-xs text-gray-400 dark:text-gray-600 ml-2">
                    Coming Soon
                  </span>
                )}
                
                {!option.disabled && value === option.value && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
