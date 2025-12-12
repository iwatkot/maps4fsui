/**
 * Custom hook for checking backend version status and update availability
 */

import { useState, useEffect } from 'react';
import { getBackendVersionStatus } from '@/api/service';
import logger from '@/utils/logger';

export const useVersionStatus = () => {
  const [versionStatus, setVersionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkVersionStatus = async () => {
      try {
        // logger.info('Checking backend version status for updates');
        setIsLoading(true);
        setError(null);
        
        const statusResponse = await getBackendVersionStatus();
        
        setVersionStatus({
          currentVersion: statusResponse.current_version,
          latestVersion: statusResponse.latest_version,
          isLatest: statusResponse.is_latest
        });
        
        if (!statusResponse.is_latest) {
          // logger.info(`Update available: ${statusResponse.current_version} -> ${statusResponse.latest_version}`);
        } else {
          // logger.info('Backend is running the latest version');s
        }
        
      } catch (error) {
        logger.error('Version status check failed:', error.message);
        setVersionStatus(null);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Check version status immediately on mount
    checkVersionStatus();

    // Set up periodic check for updates (every 5 minutes)
    const interval = setInterval(checkVersionStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    versionStatus,
    isLoading,
    error,
    hasUpdateAvailable: versionStatus && !versionStatus.isLatest
  };
};