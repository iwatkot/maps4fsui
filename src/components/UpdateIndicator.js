'use client';

import { useState, useRef, useEffect } from 'react';
import { useServerUpgrade } from '@/hooks/useServerUpgrade';

export default function UpdateIndicator({ 
  currentVersion, 
  latestVersion, 
  className = "" 
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef(null);
  
  const { 
    isUpgradable, 
    isUpgrading, 
    upgradeError, 
    upgradeSuccess,
    checkUpgradable,
    performUpgrade 
  } = useServerUpgrade();

  // Check if upgrade is available when component mounts
  useEffect(() => {
    if (!isDismissed) {
      checkUpgradable();
    }
  }, [checkUpgradable, isDismissed]);

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

  const handleUpgradeClick = async () => {
    if (!isUpgradable || isUpgrading) return;
    
    try {
      await performUpgrade();
    } catch (error) {
      // Error is already handled in the hook
      console.error('Upgrade failed:', error);
    }
  };

  const getUpgradeButtonTooltip = () => {
    if (isUpgrading) return "Upgrade in progress...";
    if (isUpgradable === false) return "Unable to perform auto upgrade, perform the upgrade manually";
    if (isUpgradable === true) return "Click to upgrade server automatically";
    return "Checking upgrade availability...";
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
          
          {/* Upgrade Button */}
          <button
            onClick={handleUpgradeClick}
            disabled={isUpgradable !== true || isUpgrading}
            className={`ml-2 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
              isUpgradable === true && !isUpgrading
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            title={getUpgradeButtonTooltip()}
          >
            {isUpgrading ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Upgrading...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <i className="zmdi zmdi-download"></i>
                <span>Upgrade</span>
              </div>
            )}
          </button>
          
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
            className="update-tooltip fixed z-[10000] bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700 dark:border-gray-600"
            style={{
              top: '60px', // Just below the header
              right: '120px', // Move further left so the full tooltip is visible
              minWidth: '200px',
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className="space-y-2">
              <div>Latest: <span className="font-mono">{latestVersion}</span></div>
              
              {/* Upgrade Status */}
              <div className="border-t border-gray-600 dark:border-gray-500 pt-2">
                {isUpgradable === null && (
                  <div className="flex items-center space-x-1 text-yellow-300">
                    <div className="w-2 h-2 border border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking upgrade availability...</span>
                  </div>
                )}
                
                {isUpgradable === true && !isUpgrading && (
                  <div className="flex items-center space-x-1 text-green-300">
                    <i className="zmdi zmdi-check-circle"></i>
                    <span>Auto-upgrade available</span>
                  </div>
                )}
                
                {isUpgradable === false && (
                  <div className="flex items-center space-x-1 text-red-300">
                    <i className="zmdi zmdi-alert-triangle"></i>
                    <span>Auto-upgrade not available</span>
                  </div>
                )}
                
                {isUpgrading && (
                  <div className="flex items-center space-x-1 text-blue-300">
                    <div className="w-2 h-2 border border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                    <span>Upgrade in progress...</span>
                  </div>
                )}
                
                {upgradeSuccess && (
                  <div className="flex items-center space-x-1 text-green-300">
                    <i className="zmdi zmdi-check"></i>
                    <span>Upgrade initiated successfully</span>
                  </div>
                )}
                
                {upgradeError && (
                  <div className="text-red-300">
                    <div className="mt-1 text-xs opacity-80 break-words">{upgradeError}</div>
                  </div>
                )}
              </div>
              
              {/* Manual Upgrade Guide */}
              <div className="border-t border-gray-600 dark:border-gray-500 pt-2">
                <a 
                  href="https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment#upgrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 flex items-center space-x-1"
                >
                  <i className="zmdi zmdi-info-outline"></i>
                  <span>Manual Upgrade Guide</span>
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