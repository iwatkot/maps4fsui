'use client';

import { useState, useEffect } from 'react';
import InfoIcon from './InfoIcon';

export default function TextInput({ 
  label, 
  value, 
  onChange, 
  placeholder = "Enter text...",
  labelWidth = "auto",  // Same as Selector for consistency
  validator = null,     // Function to validate input
  errorMessage = "Invalid input",  // Error message to show
  tooltip = null,        // Optional tooltip text
  showTooltip = true     // Controls whether tooltip is shown even if tooltip text is provided
}) {
  const [isValid, setIsValid] = useState(null); // null = not validated, true = valid, false = invalid
  const [showError, setShowError] = useState(false);

  // Validate input whenever value changes
  useEffect(() => {
    if (validator && value.trim() !== '') {
      const valid = validator(value);
      setIsValid(valid);
      setShowError(!valid);
    } else {
      setIsValid(null);
      setShowError(false);
    }
  }, [value, validator]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="mb-6">
      <div className="relative">
        {/* Input with integrated label */}
        <div className="gradient-surface interactive-shadow focus-ring w-full text-left flex items-center group">
          {/* Label Section */}
          <div className={`px-4 py-3 border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center min-w-0 flex-shrink-0 rounded-l-xl ${labelWidth !== 'auto' ? labelWidth : ''}`}>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {label}
            </span>
            <InfoIcon tooltip={tooltip} showTooltip={showTooltip} />
          </div>
          
          {/* Input Section */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white font-medium placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none pr-12"
            />
            
            {/* Validation Icon */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isValid === true && (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {isValid === false && (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Error Message Dropdown */}
        {showError && errorMessage && (
          <div 
            className="panel-backdrop absolute z-10 w-full mt-2 overflow-hidden"
            style={{
              animation: 'dropdownOpen 200ms ease-out forwards'
            }}
          >
            <div className="px-4 py-3 flex items-center space-x-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
