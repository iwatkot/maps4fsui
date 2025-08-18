'use client';

import { useState, useEffect } from 'react';
import InfoIcon from './InfoIcon';

export default function NumberInput({ 
  label, 
  value, 
  onChange, 
  min = null,
  max = null,
  step = 1,
  placeholder = "Enter number...",
  labelWidth = "auto",
  validator = null,
  errorMessage = "Invalid number",
  tooltip = null,
  showTooltip = true,
  size = "md"  // "sm", "md", "lg" - controls component height
}) {
  const [isValid, setIsValid] = useState(null);
  const [showError, setShowError] = useState(false);

  // Validate input whenever value changes
  useEffect(() => {
    if (value !== null && value !== undefined && value !== '') {
      let valid = true;
      const numValue = parseFloat(value);
      
      // Check if it's a valid number
      if (isNaN(numValue)) {
        valid = false;
      } else {
        // Check min/max constraints
        if (min !== null && numValue < min) valid = false;
        if (max !== null && numValue > max) valid = false;
        
        // Run custom validator if provided
        if (validator && !validator(numValue)) valid = false;
      }
      
      setIsValid(valid);
      setShowError(!valid);
    } else {
      setIsValid(null);
      setShowError(false);
    }
  }, [value, min, max, validator]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue === '' ? '' : parseFloat(newValue) || 0);
  };

  const handleIncrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue + step;
    if (max === null || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue - step;
    if (min === null || newValue >= min) {
      onChange(newValue);
    }
  };

  const getConstraintsText = () => {
    if (min !== null && max !== null) {
      return `Range: ${min} - ${max}`;
    } else if (min !== null) {
      return `Minimum: ${min}`;
    } else if (max !== null) {
      return `Maximum: ${max}`;
    }
    return '';
  };

  // Size variants
  const sizeClasses = {
    sm: "min-h-[48px]",
    md: "min-h-[60px]", 
    lg: "min-h-[72px]"
  };

  const labelSizeClasses = {
    sm: "min-h-[48px] text-xs",
    md: "min-h-[60px] text-sm",
    lg: "min-h-[72px] text-base"
  };

  return (
    <div className="mb-6">
      <div className="relative">
        {/* Input with integrated label */}
        <div className={`gradient-surface interactive-shadow focus-ring w-full text-left flex items-center group ${sizeClasses[size]}`}>
          {/* Label Section */}
          <div className={`px-4 border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-between min-w-0 flex-shrink-0 rounded-l-xl ${labelSizeClasses[size]} ${labelWidth !== 'auto' ? labelWidth : ''}`}>
            <span className="font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {label}
            </span>
            <InfoIcon tooltip={tooltip} showTooltip={showTooltip} />
          </div>
          
          {/* Input Section */}
          <div className="flex-1 relative flex items-center">
            <input
              type="number"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white font-medium placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none pr-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            
            {/* +/- Buttons */}
            <div className="absolute right-4 flex items-center space-x-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={min !== null && parseFloat(value) <= min}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={max !== null && parseFloat(value) >= max}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              
              {/* Validation Icon - only show when validator is provided */}
              {validator && isValid === true && (
                <svg className="w-5 h-5 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {validator && isValid === false && (
                <svg className="w-5 h-5 text-red-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Error Message Dropdown */}
        {showError && (
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
              <div>
                <span className="text-sm text-red-600 dark:text-red-400 block">
                  {errorMessage}
                </span>
                {getConstraintsText() && (
                  <span className="text-xs text-red-500 dark:text-red-300 block mt-1">
                    {getConstraintsText()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
