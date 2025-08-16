'use client';

import { useState } from 'react';
import InfoIcon from './InfoIcon';

export default function Selector({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option...",
  labelWidth = "auto",  // "auto" for content-based, or Tailwind class like "w-32"
  tooltip = null,  // Optional tooltip text
  showTooltip = true  // Controls whether tooltip is shown even if tooltip text is provided
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue, option) => {
    if (option.disabled) return; // Don't select disabled options
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
          <div className={`px-4 py-3 border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-between min-w-0 flex-shrink-0 rounded-l-xl ${labelWidth !== 'auto' ? labelWidth : ''}`}>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {label}
            </span>
            <InfoIcon tooltip={tooltip} showTooltip={showTooltip} />
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
          <div 
            className="panel-backdrop absolute z-10 w-full mt-2 overflow-hidden"
            style={{
              animation: 'dropdownOpen 200ms ease-out forwards'
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value, option)}
                disabled={option.disabled}
                className={`dropdown-option ${
                  value === option.value ? 'dropdown-option--selected' : ''
                } ${option.disabled ? 'dropdown-option--disabled' : ''}`}
              >
                <div className={`status-dot ${
                  value === option.value ? 'status-dot--active' : 
                  option.disabled ? 'status-dot--disabled' : 'status-dot--inactive'
                }`}></div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    option.disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {option.label}
                  </div>
                  {option.description && (
                    <div className={`text-xs ${
                      option.disabled ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {option.description}
                    </div>
                  )}
                </div>
                {option.disabled && (
                  <svg className="w-4 h-4 text-gray-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                )}
                {!option.disabled && value === option.value && (
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
