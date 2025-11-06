'use client';

import { useState, useEffect } from 'react';

const SERVER_STATUS_URL = 'https://info.maps4fs.xyz/health';
const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Hook to fetch and monitor public server status
 * Only active when running in public version
 */
export function usePublicServerStatus(isPublicVersion) {
  const [serverStatus, setServerStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if running in public version
    if (!isPublicVersion) {
      setIsLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(SERVER_STATUS_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setServerStatus(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch server status:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling interval
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isPublicVersion]);

  return { serverStatus, isLoading, error };
}
