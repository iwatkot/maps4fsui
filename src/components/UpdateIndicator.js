'use client';

import { useState, useRef } from 'react';

export default function UpdateIndicator({ 
  currentVersion, 
  latestVersion, 
  className = "" 
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef(null);

  if (isDismissed) return null;

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = (e) => {
    // Add a small delay before hiding to allow moving to tooltip
    setTimeout(() => {
      // Check if mouse is over the tooltip element
      const tooltip = document.querySelector('.update-tooltip');
      if (!tooltip || !tooltip.matches(':hover')) {
        setShowTooltip(false);
      }
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className={`flex items-center mr-4 ${className}`}>
      {/* Update available indicator */}
      <div className="relative">
        <div 
          ref={badgeRef}
          className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-800 text-xs"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="font-medium">New version available</span>
          <button
            onClick={() => setIsDismissed(true)}
            className="ml-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 transition-colors"
            title="Dismiss"
          >
            <i className="zmdi zmdi-close text-xs"></i>
          </button>
        </div>
        
        {/* Tooltip */}
        {showTooltip && (
          <div 
            className="update-tooltip fixed z-[10000] bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap border border-gray-700 dark:border-gray-600"
            style={{
              top: '60px', // Just below the header
              right: '120px', // Move further left so the full tooltip is visible
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className="space-y-1">
              <div>Latest: <span className="font-mono">{latestVersion}</span></div>
              <div className="border-t border-gray-600 dark:border-gray-500 pt-1 mt-1">
                <a 
                  href="https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment#upgrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 flex items-center space-x-1"
                >
                  <i className="zmdi zmdi-info-outline"></i>
                  <span>Upgrade Guide</span>
                </a>
              </div>
            </div>
            {/* Arrow pointing up to the general area */}
            <div className="absolute -top-1 right-8 w-2 h-2 bg-gray-900 dark:bg-gray-700 border-l border-t border-gray-700 dark:border-gray-600 transform rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
}