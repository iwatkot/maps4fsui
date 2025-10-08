'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useServerUpgrade } from '@/hooks/useServerUpgrade';

export default function UpdateIndicator({ 
  currentVersion, 
  latestVersion, 
  className = "" 
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
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

  // Show overlay when upgrade is successful
  useEffect(() => {
    if (upgradeSuccess) {
      setShowUpgradeOverlay(true);
      setShowTooltip(false); // Hide any open tooltip
      // Note: We don't auto-dismiss the indicator since user might want to see it again
    }
  }, [upgradeSuccess]);

  // Auto-dismiss overlay after 30 seconds as a fallback
  useEffect(() => {
    if (showUpgradeOverlay) {
      // Prevent body scrolling when overlay is shown
      document.body.style.overflow = 'hidden';
      
      const timer = setTimeout(() => {
        setShowUpgradeOverlay(false);
      }, 30000); // 30 seconds

      return () => {
        clearTimeout(timer);
        // Restore body scrolling when overlay is hidden
        document.body.style.overflow = 'unset';
      };
    } else {
      // Also restore scrolling when overlay is hidden via state change
      document.body.style.overflow = 'unset';
    }
  }, [showUpgradeOverlay]);

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
    <>
      {!isDismissed && (
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
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md cursor-pointer'
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
      )}

      {/* Full-screen Upgrade Overlay - Shows regardless of dismissed state */}
      {showUpgradeOverlay && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[99999] flex items-center justify-center transition-all duration-300 ease-out">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl border border-gray-200 dark:border-gray-600 relative transform transition-all duration-300 ease-out">
            {/* Close button */}
            <button
              onClick={() => setShowUpgradeOverlay(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Dismiss overlay (upgrade continues in background)"
            >
              <i className="zmdi zmdi-close text-lg"></i>
            </button>
            
            <div className="mb-4">
              <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Upgrade Initiated
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The server upgrade has been initiated and is running in the background. 
              This process may take several minutes to complete.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              The server may restart during the upgrade process. Please wait patiently 
              and avoid refreshing the page.
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-600 mb-4">
              Upgrading to version {latestVersion}...
            </div>
            
            {/* Dismiss button */}
            <button
              onClick={() => setShowUpgradeOverlay(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Continue in Background
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}