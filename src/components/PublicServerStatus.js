'use client';

import { useState } from 'react';
import { usePublicServerStatus } from '@/hooks/usePublicServerStatus';

const QUEUE_LIMIT = 10;

/**
 * Compact server status indicator for public version
 * Shows online status and queue size for each server
 */
export default function PublicServerStatus({ isPublicVersion }) {
  const { serverStatus, isLoading, error } = usePublicServerStatus(isPublicVersion);
  const [showTooltip, setShowTooltip] = useState(false);

  // DISABLED: Don't render the component for now
  return null;

  // Don't render if not public version or still loading initially
  if (!isPublicVersion || isLoading) {
    return null;
  }

  // Don't render if there's an error
  if (error || !serverStatus) {
    return null;
  }

  // Extract server info
  const servers = Object.entries(serverStatus).map(([name, info]) => ({
    name: name.replace(/^server(\d+)$/i, 'Server $1'), // Format server1 -> Server 1
    online: info.online,
    queueSize: info.queue_size
  }));

  // Calculate total stats
  const onlineServers = servers.filter(s => s.online).length;
  const totalServers = servers.length;
  const totalQueueSize = servers.reduce((sum, s) => sum + (s.queueSize || 0), 0);
  const totalCapacity = totalServers * QUEUE_LIMIT;

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      const tooltip = document.querySelector('.server-status-tooltip');
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
    <div className="flex items-center mr-4">
      <div 
        className="flex items-center space-x-2 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Server status indicator */}
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            onlineServers === totalServers 
              ? 'bg-green-500' 
              : onlineServers > 0 
              ? 'bg-yellow-500' 
              : 'bg-red-500'
          }`}></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {onlineServers}/{totalServers}
          </span>
        </div>

        {/* Separator */}
        <span className="text-gray-300 dark:text-gray-600">•</span>

        {/* Queue status */}
        <div className="flex items-center space-x-1">
          <i className="zmdi zmdi-time text-gray-500 dark:text-gray-400"></i>
          <span className={`font-mono font-medium ${
            totalQueueSize >= totalCapacity * 0.8 
              ? 'text-red-600 dark:text-red-400' 
              : totalQueueSize >= totalCapacity * 0.5 
              ? 'text-yellow-600 dark:text-yellow-400' 
              : 'text-green-600 dark:text-green-400'
          }`}>
            {totalQueueSize}/{totalCapacity}
          </span>
        </div>

        {/* Info icon */}
        <i className="zmdi zmdi-info-outline text-gray-400 cursor-help"></i>
      </div>

      {/* Tooltip - Fixed positioning like UpdateIndicator */}
      {showTooltip && (
        <div 
          className="server-status-tooltip fixed z-[10000] bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700 dark:border-gray-600"
          style={{
            top: '60px',
            right: '120px',
            minWidth: '200px',
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="space-y-2">
            <div className="font-semibold mb-2">
              Server Queues
            </div>
            {servers.map((server) => (
              <div key={server.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    server.online ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span>
                    {server.name}
                  </span>
                </div>
                <span className="font-mono text-gray-300">
                  {server.queueSize}/{QUEUE_LIMIT}
                </span>
              </div>
            ))}
          </div>
          {/* Arrow pointing up */}
          <div className="absolute -top-1 right-8 w-2 h-2 bg-gray-900 dark:bg-gray-700 border-l border-t border-gray-700 dark:border-gray-600 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
