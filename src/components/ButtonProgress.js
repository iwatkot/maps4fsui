'use client';

import { getSizeClasses } from './componentSizes';
import { getStatusConfig, STATUS_TYPES } from '@/config/statusConfig';

export default function ButtonProgress({ 
  label = "Generate",
  downloadLabel = "Download",
  onClick,
  disabled = false,
  statusType = STATUS_TYPES.IDLE, // Status type for color/behavior
  statusText = "Ready", // Display text
  progress = 0, // 0-100
  isDownloadMode = false,
  onDownload,
  labelWidth = "auto",
  size = "md",
  error = null // Error message to display
}) {
  const { container: sizeClass, label: labelSizeClass } = getSizeClasses(size);
  const statusConfig = getStatusConfig(statusType);

  const getButtonColor = () => {
    if (disabled) return "bg-gray-400 dark:bg-gray-600";
    if (isDownloadMode) return "bg-green-600 hover:bg-green-700";
    return "bg-blue-600 hover:bg-blue-700";
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (isDownloadMode) {
      onDownload?.();
    } else {
      onClick?.();
    }
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <div className={`gradient-surface interactive-shadow focus-ring w-full text-left flex items-stretch group rounded-xl overflow-hidden ${sizeClass}`}>
          {/* Button Section */}
          <button
            onClick={handleClick}
            disabled={disabled}
            className={`
              px-4 border-r-0
              ${getButtonColor()}
              flex items-center justify-between min-w-0 flex-shrink-0
              ${labelSizeClass} 
              ${labelWidth !== 'auto' ? labelWidth : 'w-40'}
              text-white font-medium transition-colors
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {isDownloadMode ? (
              <span className="whitespace-nowrap">{downloadLabel}</span>
            ) : (
              <span className="whitespace-nowrap">{label}</span>
            )}
          </button>
          
          {/* Status and Progress Section */}
          <div className="flex-1 relative overflow-hidden">
            {/* Progress Background - Full Width */}
            <div 
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: progress >= 100
                  ? statusConfig.bgColorHex
                  : progress > 0
                    ? `linear-gradient(to right, ${statusConfig.bgColorHex} 0%, ${statusConfig.bgColorHex} ${progress + 0.5}%, transparent ${progress + 0.5}%)`
                    : 'transparent'
              }}
            />
            {/* Content Layer */}
            <div className="relative z-10 w-full h-full px-4 flex items-center">
              <div className="flex items-center space-x-3">
                {/* Status Text */}
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-tight">
                  {statusText}
                </span>
                
                {/* Error Text */}
                {error && (
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && statusType === STATUS_TYPES.ERROR && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-red-600 dark:text-red-400 text-sm">⚠️</div>
            <div className="text-red-700 dark:text-red-300 text-sm font-medium">
              {error}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
