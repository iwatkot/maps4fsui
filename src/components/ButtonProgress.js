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
        <div className={`gradient-surface interactive-shadow focus-ring w-full text-left flex items-center group ${sizeClass}`}>
          {/* Button Section */}
          <button
            onClick={handleClick}
            disabled={disabled}
            className={`
              px-6 border-r border-gray-200 dark:border-gray-600 
              ${getButtonColor()}
              flex items-center justify-center min-w-0 flex-shrink-0 rounded-l-xl 
              ${labelSizeClass} 
              ${labelWidth !== 'auto' ? labelWidth : 'w-40'}
              text-white font-semibold transition-colors
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              flex items-center space-x-2
            `}
          >
            {isDownloadMode ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{downloadLabel}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>{label}</span>
              </>
            )}
          </button>
          
          {/* Status and Progress Section */}
          <div className="flex-1 relative flex items-center px-4">
            <div className="flex-1 flex items-center space-x-3">
              {/* Status Text */}
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {status}
              </span>
              
              {/* Progress Bar */}
              <div className="flex-1 relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor()} transition-all duration-300 ease-out`}
                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  />
                </div>
                {/* Progress Text */}
                {progress > 0 && (
                  <span className="absolute right-0 top-3 text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
            </div>
            
            {/* Tooltip Icon */}
            <InfoIcon tooltip={tooltip} showTooltip={showTooltip} />
          </div>
        </div>
      </div>
    </div>
  );
}
