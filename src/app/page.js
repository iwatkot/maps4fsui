'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import GeneratorTab from '@/app/tabs/GeneratorTab';
import MyMapsTab from '@/app/tabs/MyMapsTab';
import PresetsTab from '@/app/tabs/PresetsTab';
import SettingsTab from '@/app/tabs/SettingsTab';
import SchemasTab from '@/app/tabs/SchemasTab';
import SlideOutPromo from '@/components/SlideOutPromo';
import SurveyPopup from '@/components/SurveyPopup';
import { useBackendVersion } from '@/hooks/useBackendVersion';
import { useVersionStatus } from '@/hooks/useVersionStatus';
import StickyFooter from '@/components/StickyFooter';
import config from '@/app/config';
import logger from '@/utils/logger';

const isPublicVersion = config.isPublicVersion;
const backendUrl = config.backendUrl;
logger.info(`Running in public version: ${isPublicVersion}. Backend URL: ${backendUrl}`);

export default function Home() {

  // Tab state
  const [activeTab, setActiveTab] = useState('generator');

  // Map duplication state
  const [duplicateMapData, setDuplicateMapData] = useState(null);

  // Promo state (only for public version) - avoid hydration mismatch
  const [showPromo, setShowPromo] = useState(isPublicVersion);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting and localStorage check
  useEffect(() => {
    setIsClient(true);
    if (isPublicVersion) {
      const promoClosed = localStorage.getItem('maps4fs-promo-closed');
      if (promoClosed === 'true') {
        setShowPromo(false);
      }
    }
  }, []);

  // Handler to close promo and save to localStorage
  const handleClosePromo = () => {
    setShowPromo(false);
    localStorage.setItem('maps4fs-promo-closed', 'true');
  };

  // Handler for map duplication
  const handleDuplicateMap = (mapData) => {
    setDuplicateMapData(mapData);
    setActiveTab('generator');
  };

  // Backend version state managed here
  const { 
    backendVersion: currentBackendVersion, 
    isBackendAvailable, 
    backendError 
  } = useBackendVersion();

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden" style={{ minWidth: '1000px' }}>
      {/* Shared App Header */}
      <AppHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showTabs={true}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'generator' && (
          <div className="absolute inset-0 animate-fade-in">
            <GeneratorTab 
              backendVersion={currentBackendVersion}
              isBackendAvailable={isBackendAvailable}
              backendError={backendError}
              isPublicVersion={isPublicVersion}
              duplicateMapData={duplicateMapData}
              onDuplicateDataProcessed={() => setDuplicateMapData(null)}
            />
          </div>
        )}
        {activeTab === 'schemas' && (
          <div className="absolute inset-0 animate-fade-in">
            <SchemasTab />
          </div>
        )}
        {activeTab === 'presets' && !isPublicVersion && (
          <div className="absolute inset-0 animate-fade-in">
            <PresetsTab />
          </div>
        )}
        {activeTab === 'settings' && !isPublicVersion && (
          <div className="absolute inset-0 animate-fade-in">
            <SettingsTab />
          </div>
        )}
        {activeTab === 'my-maps' && (
          <div className="absolute inset-0 animate-fade-in">
            <MyMapsTab 
              onDuplicateMap={handleDuplicateMap}
            />
          </div>
        )}
      </div>

      {/* Slide-out Promo (only for public version) */}
      {isClient && isPublicVersion && (
        <SlideOutPromo
          title="Launch the tool locally"
          message="Use it without limitations on your own machine with full access to all features and faster processing."
          buttonText="Local Deployment"
          buttonLink="https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment"
          isVisible={showPromo}
          onClose={handleClosePromo}
        />
      )}

      {/* Survey Popup (show on generator tab) */}
      {isClient && activeTab === 'generator' && (
        <SurveyPopup isPublic={isPublicVersion} />
      )}

      {/* Footer */}
      <StickyFooter />
    </div>
  );
}
