'use client';

import { useState, useRef } from 'react';
import InfoIcon from './InfoIcon';

export default function Slider({ 
  label, 
  value, 
  onChange, 
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  placeholder = "Enter value...",
  labelWidth = "auto",
  tooltip = null,
  showTooltip = true,
  size = "md"  // "sm", "md", "lg" - controls component height
}) {
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const sliderRef = useRef(null);

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleInputToggle = () => {
    if (isInputMode) {
      // Switching from input to slider - validate and apply
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue) && numValue >= min && numValue <= max) {
        onChange(numValue);
      } else {
        // Reset to current value if invalid
        setInputValue(value.toString());
      }
    } else {
      // Switching from slider to input
      setInputValue(value.toString());
    }
    setIsInputMode(!isInputMode);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputToggle();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsInputMode(false);
    }
  };

  const handleInputBlur = (e) => {
    // Don't auto-apply if clicking on the cancel button
    if (e.relatedTarget && e.relatedTarget.title === 'Cancel') {
      return;
    }
    handleInputToggle();
  };

  // Calculate percentage for slider thumb position
  const percentage = ((value - min) / (max - min)) * 100;

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
          
          {/* Slider/Input Section */}
          <div className="flex-1 relative flex items-center px-4">
            {!isInputMode ? (
              <>
                {/* Slider */}
                <div className="flex-1 relative mr-4">
                  <input
                    ref={sliderRef}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                
                {/* Value Display */}
                <div className="flex items-center space-x-2">
                                    {/* Value Display */}
                  <span className="text-sm font-medium text-gray-900 dark:text-white min-w-0">
                    {value}
                  </span>
                  
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={handleInputToggle}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Enter value manually"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Manual Input */}
                <input
                  type="number"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onBlur={handleInputBlur}
                  min={min}
                  max={max}
                  step={step}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white font-medium placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none mr-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoFocus
                />
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleInputToggle}
                    className="w-8 h-8 flex items-center justify-center rounded border border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors text-green-600 dark:text-green-400"
                    title="Apply value"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue(value.toString());
                      setIsInputMode(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Cancel"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          border: none;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .slider-thumb::-moz-range-track {
          background: transparent;
        }
        
        .dark .slider-thumb::-webkit-slider-thumb {
          border-color: #374151;
        }
        
        .dark .slider-thumb::-moz-range-thumb {
          border-color: #374151;
        }
      `}</style>
    </div>
  );
}
