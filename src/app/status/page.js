'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';

// Hardcoded endpoints - for debug use localhost, for production use maps4fs.xyz
const USE_DEBUG = false; // Set to false for production

const ENDPOINTS = USE_DEBUG ? [
  'http://localhost:8000/info/health',
  'http://localhost:8001/info/health'
] : [
  'https://maps4fs.xyz:9000/info/health',
  'https://maps4fs.xyz:9001/info/health'
];

// Status color mapping
const STATUS_COLORS = {
  'Completed': 'bg-green-500',
  'Failed': 'bg-red-500',
  'Started processing': 'bg-blue-500',
  'Added to queue': 'bg-gray-500',
  'default': 'bg-gray-400'
};

const getStatusColor = (status) => {
  for (const [key, color] of Object.entries(STATUS_COLORS)) {
    if (status?.startsWith(key)) {
      return color;
    }
  }
  return STATUS_COLORS.default;
};

const isProcessing = (status) => {
  return status?.startsWith('Started processing');
};

export default function StatusPage() {
  const router = useRouter();
  const [backendData, setBackendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealthData = async () => {
    try {
      // Don't show loading state on refresh, only on initial load
      const isInitialLoad = backendData.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      const promises = ENDPOINTS.map(async (endpoint, index) => {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.json();
          return {
            endpoint,
            index: index + 1,
            online: true,
            data
          };
        } catch (err) {
          return {
            endpoint,
            index: index + 1,
            online: false,
            error: err.message
          };
        }
      });

      const results = await Promise.all(promises);
      setBackendData(results);
    } catch (err) {
      setError('Failed to fetch health data');
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderBackendStatus = (backend) => {
    if (!backend.online) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            <h3 className="text-base font-semibold text-red-800 dark:text-red-200">
              Backend #{backend.index} - Offline
            </h3>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300 mt-2">
            <strong>Error:</strong> {backend.error}
          </p>
        </div>
      );
    }

    const { data } = backend;
    const queuePercentage = data.max_queue_size > 0 
      ? (data.queue_size / data.max_queue_size) * 100 
      : 0;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* Backend Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Backend #{backend.index}
            </h3>
          </div>
        </div>

        {/* Basic Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Online Status */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
            <div className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">
              Status
            </div>
            <div className="text-lg font-bold text-green-800 dark:text-green-200">
              Online
            </div>
          </div>

          {/* Queue Size */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
              Queue Load
            </div>
            <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
              {data.queue_size} / {data.max_queue_size}
            </div>
            <div className="mt-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    queuePercentage > 80 ? 'bg-red-500' : 
                    queuePercentage > 50 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${queuePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
            <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-1">
              Uptime
            </div>
            <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
              {data.online_since}
            </div>
          </div>
        </div>

        {/* History Timeline */}
        {data.history && data.history.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Recent Activity
            </h4>
            <div>
              {data.history.map((item, idx) => {
                const statusColor = getStatusColor(item.status);
                const isCurrentlyProcessing = isProcessing(item.status);
                return (
                  <div key={idx} className="flex" style={{ minHeight: '24px' }}>
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center mr-3" style={{ width: '12px', position: 'relative' }}>
                      <div className="relative flex items-center justify-center" style={{ height: '12px', marginTop: '6px' }}>
                        {/* Animated ring for processing items */}
                        {isCurrentlyProcessing && (
                          <div className={`absolute w-3 h-3 rounded-full ${statusColor} animate-ping opacity-75`}></div>
                        )}
                        {/* Main dot */}
                        <div className={`relative w-3 h-3 rounded-full ${statusColor} border-2 border-white dark:border-gray-800 shadow-sm flex-shrink-0`}></div>
                      </div>
                      {idx < data.history.length - 1 && (
                        <div 
                          className="w-0.5 bg-gray-300 dark:bg-gray-600" 
                          style={{ 
                            position: 'absolute',
                            top: '18px',
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}
                        ></div>
                      )}
                    </div>
                    
                    {/* Content - Single Line */}
                    <div className="flex-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="font-medium">{item.game_code} - {item.size}km</span>
                      <span className="text-gray-600 dark:text-gray-400 mx-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">{item.coordinates}</span>
                      <span className="text-gray-600 dark:text-gray-400 mx-2">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(!data.history || data.history.length === 0) && (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
            No recent activity
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden" style={{ minWidth: '1000px' }}>
      {/* Header */}
      <AppHeader 
        showTabs={false}
        customTitle="Server Status"
        onBackClick={() => router.back()}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Backend Server Status
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time monitoring • Auto-refresh every 30 seconds
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <i className="zmdi zmdi-alert-triangle text-red-600 dark:text-red-400 mr-3"></i>
                <div>
                  <h3 className="text-red-800 dark:text-red-200 font-medium">Error</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State - only show on initial load */}
          {loading && backendData.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading server status...</p>
            </div>
          )}

          {/* Backend Status Cards - Horizontal Split */}
          {backendData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backendData.map((backend) => (
                <div key={backend.endpoint}>
                  {renderBackendStatus(backend)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
