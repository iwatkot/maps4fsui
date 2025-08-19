'use client';

import InfoIcon from './InfoIcon';
import { getSizeClasses } from './componentSizes';

export default function Switch({ 
  label, 
  checked, 
  onChange, 
  labelWidth = "auto",
  tooltip = null,
  showTooltip = true,
  size = "md",  // "sm", "md", "lg" - controls component height
  disabled = false
}) {
  const { container: sizeClass, label: labelSizeClass } = getSizeClasses(size);

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className="mb-6">
      <div className="relative">
        {/* Switch with integrated label - following exact pattern of other components */}
        <div className={`gradient-surface interactive-shadow focus-ring w-full text-left flex items-center group ${sizeClass} ${disabled ? 'opacity-50' : ''}`}>
          {/* Label Section */}
          <div className={`px-4 border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-between min-w-0 flex-shrink-0 rounded-l-xl ${labelSizeClass} ${labelWidth !== 'auto' ? labelWidth : ''}`}>
            <span className="font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {label}
            </span>
            <InfoIcon tooltip={tooltip} showTooltip={showTooltip} />
          </div>
          
          {/* Switch Section */}
          <div className="flex-1 relative flex items-center justify-end px-4">
            <button
              type="button"
              onClick={handleToggle}
              disabled={disabled}
              className={`
                relative inline-flex items-center justify-center
                ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
                ${disabled 
                  ? 'cursor-not-allowed' 
                  : checked 
                    ? 'cursor-pointer hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    : 'cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }
                border border-gray-300 dark:border-gray-600
                rounded-full
                transition-all duration-200 ease-in-out
                focus:outline-none
                ${size === 'sm' ? 'h-7' : size === 'lg' ? 'h-9' : 'h-8'}
              `}
              style={{
                width: size === 'sm' ? '64px' : size === 'lg' ? '80px' : '68px'
              }}
              role="switch"
              aria-checked={checked}
              aria-labelledby={`${label}-label`}
            >
              {/* Classic round toggle */}
              <span
                className={`
                  ${checked 
                    ? (size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-5' : 'translate-x-4')
                    : (size === 'sm' ? '-translate-x-4' : size === 'lg' ? '-translate-x-5' : '-translate-x-4')
                  }
                  inline-block 
                  ${size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-6 w-6'}
                  transform rounded-full bg-white 
                  shadow-lg ring-0 transition-transform duration-200 ease-in-out
                  border border-gray-200
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
