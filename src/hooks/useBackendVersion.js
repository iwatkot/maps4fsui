/**
 * Custom hook for checking backend connectivity and version
 */

import { useState, useEffect } from 'react';
import { getBackendVersion } from '@/api/service';
import logger from '@/utils/logger';

export const useBackendVersion = () => {
  const [backendVersion, setBackendVersion] = useState(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(null); // null = loading, true = available, false = unavailable
  const [backendError, setBackendError] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // logger.info('Checking backend connectivity and version');
        setIsBackendAvailable(null); // Set to loading state
        setBackendError(null);
        
        const versionResponse = await getBackendVersion();
        
        setBackendVersion(versionResponse.version);
        setIsBackendAvailable(true);
        // logger.info(`Backend is available, version: ${versionResponse.version}`);
        
      } catch (error) {
        logger.error('Backend connectivity check failed:', error.message);
        setBackendVersion(null);
        setIsBackendAvailable(false);
        setBackendError(error.message);
      }
    };

    // Check backend immediately on mount
    checkBackend();
  }, []);

  return {
    backendVersion,
    isBackendAvailable,
    backendError
  };
};
