'use client';

import { useState, useEffect } from 'react';
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
  size = "md",
  error = null // Error message to display
}) {
  const { container: sizeClass, label: labelSizeClass } = getSizeClasses(size);

  const getProgressColor = () => {
    switch (status) {
      case "Processing":
        return "bg-blue-500";
      case "Completed":
      case "Preparing download":
      case "Map generation completed":
        return "bg-green-500";
      case "Failed":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getProgressColorHex = () => {
    switch (status) {
      case "Processing":
        return "rgb(59 130 246)"; // blue-500
      case "Completed":
      case "Preparing download":
      case "Map generation completed":
        return "rgb(34 197 94)"; // green-500
      case "Failed":
        return "rgb(239 68 68)"; // red-500
      default:
        return "rgb(209 213 219)"; // gray-300
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
          <div className="flex-1 relative rounded-r-xl overflow-hidden" style={{
            background: progress > 0 
              ? `linear-gradient(to right, ${getProgressColorHex()} 0%, ${getProgressColorHex()} ${Math.max(0, Math.min(100, progress))}%, transparent ${Math.max(0, Math.min(100, progress))}%, transparent 100%)`
              : 'transparent'
          }}>
            {/* Content over progress */}
            <div className="relative w-full h-full px-4 flex items-center">
              <div className="flex items-center space-x-3">
                {/* Status Text */}
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {status}
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
      {error && status === "Failed" && (
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
