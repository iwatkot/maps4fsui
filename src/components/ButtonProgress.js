'use client';

import { useState, useEffect } from 'react';
import InfoIcon from './InfoIcon';
import { getSizeClasses } from './componentSizes';

export default function ButtonProgress({ 
  label = "Generate",
  downloadLabel = "Download",
  onClick,
  disabled = false,
  status = "Ready", // "Ready", "Starting", "Processing", "Completed", "Failed"
  progress = 0, // 0-100
  isDownloadMode = false,
  onDownload,
  labelWidth = "auto",
  tooltip = null,
  showTooltip = true,
  size = "md"
}) {
  const { container: sizeClass, label: labelSizeClass } = getSizeClasses(size);

  const getProgressColor = () => {
    switch (status) {
      case "Processing":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "Failed":
        return "bg-red-500";
      default:
        return "bg-gray-300 dark:bg-gray-600";
    }
  };

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
        <div className={`gradient-surface interactive-shadow focus-ring w-full text-left flex items-stretch group ${sizeClass}`}>
          {/* Button Section */}
          <button
            onClick={handleClick}
            disabled={disabled}
            className={`
              px-4 border-r border-gray-200 dark:border-gray-600 
              ${getButtonColor()}
              flex items-center justify-between min-w-0 flex-shrink-0 rounded-l-xl 
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
          <div className="flex-1 relative flex items-center overflow-hidden rounded-r-xl">
            {/* Progress Background Fill - Full Height */}
            <div 
              className={`absolute top-0 left-0 bottom-0 ${getProgressColor()} transition-all duration-500 ease-out`}
              style={{ 
                width: `${Math.max(0, Math.min(100, progress))}%`,
                opacity: progress > 0 ? 0.3 : 0
              }}
            />
            
            {/* Content over progress - Full Height */}
            <div className="relative w-full h-full px-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Status Text */}
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {status}
                </span>
                
                {/* Progress Text */}
                {progress > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
              
              {/* Tooltip Icon */}
              <InfoIcon tooltip={tooltip} showTooltip={showTooltip} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
