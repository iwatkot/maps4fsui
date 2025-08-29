'use client';

import { useState, useEffect } from 'react';
import MainTabs from '@/components/MainTabs';
import GeneratorTab from '@/app/tabs/GeneratorTab';
import MyMapsTab from '@/app/tabs/MyMapsTab';
import { useBackendVersion } from '@/hooks/useBackendVersion';
import config from '@/app/config';
import logger from '@/utils/logger';

const isPublicVersion = config.isPublicVersion;
const backendUrl = config.backendUrl;
logger.info(`Running in public version: ${isPublicVersion}. Backend URL: ${backendUrl}`);

export default function Home() {

  // Tab state
  const [activeTab, setActiveTab] = useState('generator');

  // Backend version state managed here
  const { 
    backendVersion: currentBackendVersion, 
    isBackendAvailable, 
    backendError 
  } = useBackendVersion();

  // Update the global backend version constant
  useEffect(() => {
    if (currentBackendVersion) {
      config.backendVersion = currentBackendVersion;
      logger.info(`Backend version set to: ${config.backendVersion}`);
    }
  }, [currentBackendVersion]);

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
      disabled: true // Disabled for now
    }] : [])
  ];

  // Define right navigation links
  const rightNavLinks = (
    <>
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

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Main Navigation Header */}
      <MainTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rightContent={rightNavLinks}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'generator' && (
          <GeneratorTab 
            backendVersion={currentBackendVersion}
            isBackendAvailable={isBackendAvailable}
            backendError={backendError}
            isPublicVersion={isPublicVersion}
          />
        )}
        {activeTab === 'my-maps' && <MyMapsTab />}
      </div>
    </div>
  );
}
