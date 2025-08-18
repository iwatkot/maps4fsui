'use client';

import { useState } from 'react';
import InfoIcon from './InfoIcon';

export default function Expander({ 
  label, 
  children,
  defaultExpanded = false,
  summary = null,  // Optional summary text for the middle section
  labelWidth = "auto",  // Same as other components for consistency
  tooltip = null,  // Optional tooltip text
  showTooltip = true,  // Controls whether tooltip is shown
  onToggle = null,  // Optional callback when expanded/collapsed
  size = "md"  // "sm", "md", "lg" - controls component height
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
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
        {/* Expander Header Button */}
        <button
          onClick={handleToggle}
          className={`gradient-surface interactive-shadow focus-ring w-full text-left flex items-center group ${sizeClasses[size]}`}
        >
          {/* Label Section */}
          <div className={`px-4 border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-between min-w-0 flex-shrink-0 rounded-l-xl ${labelSizeClasses[size]} ${labelWidth !== 'auto' ? labelWidth : ''}`}>
            <span className="font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {label}
            </span>
            <InfoIcon tooltip={tooltip} showTooltip={showTooltip} />
          </div>
          
          {/* Content Section (Summary) */}
          <div className="flex-1 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {summary ? (
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {summary}
                </span>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-600">
                  {isExpanded ? 'Click to collapse' : 'Click to expand'}
                </span>
              )}
            </div>
            
            {/* Arrow Icon */}
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expandable Content Panel */}
        {isExpanded && (
          <div 
            className="panel-backdrop mt-2 overflow-hidden"
            style={{
              animation: 'dropdownOpen 200ms ease-out forwards'
            }}
          >
            <div className="p-4">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
