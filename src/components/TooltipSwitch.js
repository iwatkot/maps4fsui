'use client';

import { getSizeClasses } from './componentSizes';

export default function TooltipSwitch({
  label = "Helper Mode",
  description = "Show helpful tooltips for all controls",
  value,
  onChange,
  size = "md"  // "sm", "md", "lg" - controls component height and spacing
}) {
  // Get size classes from shared configuration
  const { textSize } = getSizeClasses(size);

  // Size-specific classes
  const sizeConfig = {
    sm: {
      container: "mb-4 p-3",
      title: "text-xs",
      description: "text-xs",
      switch: "h-5 w-9",
      switchThumb: "h-3 w-3",
      switchThumbActive: "translate-x-5",
      switchThumbInactive: "translate-x-1"
    },
    md: {
      container: "mb-6 p-4", 
      title: "text-sm",
      description: "text-xs",
      switch: "h-6 w-11",
      switchThumb: "h-4 w-4",
      switchThumbActive: "translate-x-6",
      switchThumbInactive: "translate-x-1"
    },
    lg: {
      container: "mb-8 p-5",
      title: "text-base",
      description: "text-sm", 
      switch: "h-7 w-13",
      switchThumb: "h-5 w-5",
      switchThumbActive: "translate-x-7",
      switchThumbInactive: "translate-x-1"
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`${config.container} bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${config.title} font-semibold text-blue-800 dark:text-blue-200`}>
            {label}
          </h3>
          <p className={`${config.description} text-blue-600 dark:text-blue-300 mt-1`}>
            {description}
          </p>
        </div>
        <button
          onClick={() => onChange(!value)}
          className={`relative inline-flex ${config.switch} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block ${config.switchThumb} transform rounded-full bg-white transition-transform ${
              value ? config.switchThumbActive : config.switchThumbInactive
            }`}
          />
        </button>
      </div>
    </div>
  );
}
