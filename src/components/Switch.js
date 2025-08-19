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
                relative inline-flex items-center
                ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                ${disabled 
                  ? 'cursor-not-allowed' 
                  : 'cursor-pointer hover:shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }
                rounded-full border-2 border-transparent
                transition-all duration-200 ease-in-out
                focus:outline-none
                ${size === 'sm' ? 'h-5 w-9' : size === 'lg' ? 'h-7 w-12' : 'h-6 w-11'}
              `}
              role="switch"
              aria-checked={checked}
              aria-labelledby={`${label}-label`}
            >
              {/* Switch toggle */}
              <span
                className={`
                  ${checked 
                    ? (size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-5' : 'translate-x-5')
                    : 'translate-x-0'
                  }
                  inline-block 
                  ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}
                  transform rounded-full bg-white 
                  shadow-lg ring-0 transition-transform duration-200 ease-in-out
                  ${size === 'sm' ? 'm-0.5' : 'm-0.5'}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
