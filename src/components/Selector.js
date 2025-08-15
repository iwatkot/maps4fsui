'use client';

import { useState } from 'react';

export default function Selector({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option..." 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="mb-6">
      <div className="relative">
        {/* Dropdown Button with integrated label */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="gradient-surface interactive-shadow focus-ring w-full text-left flex items-center group"
        >
          {/* Label Section (not clickable area) */}
          <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center min-w-0 flex-shrink-0 rounded-l-xl">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {label}
            </span>
          </div>
          
          {/* Clickable Content Section */}
          <div className="flex-1 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-gray-900 dark:text-white font-medium">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="panel-backdrop absolute z-10 w-full mt-2 overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`dropdown-option ${
                  value === option.value ? 'dropdown-option--selected' : ''
                }`}
              >
                <div className={`status-dot ${
                  value === option.value ? 'status-dot--active' : 'status-dot--inactive'
                }`}></div>
                <div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  )}
                </div>
                {value === option.value && (
                  <svg className="w-4 h-4 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
