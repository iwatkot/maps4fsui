'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import GeneratorTab from '@/app/tabs/GeneratorTab';
import MyMapsTab from '@/app/tabs/MyMapsTab';
import PresetsTab from '@/app/tabs/PresetsTab';
import SettingsTab from '@/app/tabs/SettingsTab';
import SchemasTab from '@/app/tabs/SchemasTab';
import TopVideoPromo from '@/components/TopVideoPromo';
import { useBackendVersion } from '@/hooks/useBackendVersion';
import { useVersionStatus } from '@/hooks/useVersionStatus';
import StickyFooter from '@/components/StickyFooter';
import config from '@/app/config';
import logger from '@/utils/logger';

const isPublicVersion = config.isPublicVersion;
const backendUrl = config.backendUrl;
// logger.info(`Running in public version: ${isPublicVersion}. Backend URL: ${backendUrl}`);

export default function Home() {

  // Tab state
  const [activeTab, setActiveTab] = useState('generator');

  // Map duplication state
  const [duplicateMapData, setDuplicateMapData] = useState(null);

  // Trailer promo state (only for public version) - avoid hydration mismatch
  const [showTrailerPromo, setShowTrailerPromo] = useState(isPublicVersion);
  const [isDonationPopupActive, setIsDonationPopupActive] = useState(isPublicVersion);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting and localStorage check
  useEffect(() => {
    setIsClient(true);
    if (isPublicVersion) {
      const promoClosed = localStorage.getItem('maps4fs-trailer-promo-hidden');
      if (promoClosed === 'true') {
        setShowTrailerPromo(false);
      }

      const donationActive = localStorage.getItem('maps4fs-donation-popup-active') === 'true';
      setIsDonationPopupActive(donationActive);

      const handleDonationPopupState = (event) => {
        const isActive = Boolean(event?.detail?.isActive);
        setIsDonationPopupActive(isActive);
      };

      window.addEventListener('maps4fs:donation-popup-state', handleDonationPopupState);

      return () => {
        window.removeEventListener('maps4fs:donation-popup-state', handleDonationPopupState);
      };
    }
    
    // Log page visit with IP
    fetch('/api/track/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: '/', 
        userAgent: navigator.userAgent 
      })
    }).catch(() => {}); // Silent fail
  }, []);

  // Handler to close promo for this visit only
  const handleCloseTrailerPromo = () => {
    setShowTrailerPromo(false);
  };

  // Handler to close promo and remember preference
  const handleDontShowTrailerAgain = () => {
    setShowTrailerPromo(false);
    localStorage.setItem('maps4fs-trailer-promo-hidden', 'true');
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

      {/* Trailer promo (only for public version) */}
      {isClient && isPublicVersion && !isDonationPopupActive && (
        <TopVideoPromo
          isVisible={showTrailerPromo}
          onClose={handleCloseTrailerPromo}
          onDontShowAgain={handleDontShowTrailerAgain}
        />
      )}

      {/* Footer */}
      <StickyFooter />
    </div>
  );
}
