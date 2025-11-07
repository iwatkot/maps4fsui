'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import MainTabs from '@/components/MainTabs';
import UpdateIndicator from '@/components/UpdateIndicator';
import PublicServerStatus from '@/components/PublicServerStatus';
import { useBackendVersion } from '@/hooks/useBackendVersion';
import { useVersionStatus } from '@/hooks/useVersionStatus';
import config from '@/app/config';

export default function AppHeader({ 
  activeTab = null, 
  onTabChange = null,
  showTabs = true,
  customTitle = null,
  onBackClick = null
}) {
  const isPublicVersion = config.isPublicVersion;

  // Backend version state
  const { 
    backendVersion: currentBackendVersion, 
    isBackendAvailable, 
    backendError 
  } = useBackendVersion();

  // Version status for update checking
  const { hasUpdateAvailable, versionStatus } = useVersionStatus();

  // Note: Consider using context/provider for backend version instead of global mutation
  // For now, consumers can use currentBackendVersion directly from the hook

  // Define tabs
  const tabs = [
    {
      id: 'generator',
      label: 'Map Generator',
      icon: <i className="zmdi zmdi-landscape"></i>
    },
    // Only show My Maps tab in non-public version
    ...(!isPublicVersion ? [{
      id: 'my-maps',
      label: 'My Maps',
      icon: <i className="zmdi zmdi-collection-folder-image"></i>,
    }] : []),
    // Only show Presets tab in non-public version
    ...(!isPublicVersion ? [{
      id: 'presets',
      label: 'Presets',
      icon: <i className="zmdi zmdi-storage"></i>
    }] : []),
    {
      id: 'schemas',
      label: 'Schemas Editor',
      icon: <i className="zmdi zmdi-folder-outline"></i>
    },
    // Only show Settings tab in non-public version
    ...(!isPublicVersion ? [{
      id: 'settings',
      label: 'Settings',
      icon: <i className="zmdi zmdi-settings"></i>
    }] : [])
  ];

  // Define right navigation links
  const rightNavLinks = (
    <>
      {/* Status Icon - only show in public version */}
      {isPublicVersion && (
        <Link
          href="/status"
          className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
          title="Server Status"
        >
          <i className="zmdi zmdi-chart text-5xl" style={{fontSize: '1.2rem'}}></i>
        </Link>
      )}
      <Link
        href="/survey"
        className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
        title="User Survey"
      >
        <i className="zmdi zmdi-comment-text-alt text-5xl" style={{fontSize: '1.2rem'}}></i>
      </Link>
      <Link
        href="/help"
        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        title="Get Help"
      >
        <i className="zmdi zmdi-help text-5xl" style={{fontSize: '1.2rem'}}></i>
      </Link>
      <a
        href="https://maps4fs.gitbook.io/docs/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        title="Documentation"
      >
        <i className="zmdi zmdi-book text-5xl" style={{fontSize: '1.2rem'}}></i>
      </a>
      <a
        href="https://github.com/iwatkot/maps4fs"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        title="GitHub Repository"
      >
        <i className="zmdi zmdi-github text-5xl" style={{fontSize: '1.2rem'}}></i>
      </a>
      <a
        href="https://www.youtube.com/@iwatkot"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
        title="YouTube Channel"
      >
        <i className="zmdi zmdi-youtube-play text-5xl" style={{fontSize: '1.2rem'}}></i>
      </a>
      <a
        href="https://discord.gg/Sj5QKKyE42"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
        title="Discord Server"
      >
        <i className="zmdi zmdi-comments text-5xl" style={{fontSize: '1.2rem'}}></i>
      </a>
      
      {/* Update Indicator - only show if update is available and not public version */}
      {hasUpdateAvailable && versionStatus && !isPublicVersion && (
        <UpdateIndicator 
          currentVersion={versionStatus.currentVersion}
          latestVersion={versionStatus.latestVersion}
        />
      )}
      
      {/* Public Server Status - only show in public version */}
      <PublicServerStatus isPublicVersion={isPublicVersion} />
      
      {/* Backend Version Badge */}
      {currentBackendVersion && (
        <div className="flex items-center mr-4">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
            {currentBackendVersion}
          </span>
        </div>
      )}
    </>
  );

  if (showTabs) {
    // Main page with tabs
    return (
      <MainTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        rightContent={rightNavLinks}
      />
    );
  } else {
    // Custom page with title and back button
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBackClick && (
                <button
                  onClick={onBackClick}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  title="Go Back"
                >
                  <i className="zmdi zmdi-arrow-left text-xl"></i>
                </button>
              )}
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Maps4FS{customTitle && ` - ${customTitle}`}
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {rightNavLinks}
            </div>
          </div>
        </div>
      </div>
    );
  }
}