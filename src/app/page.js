'use client';

import { useState, useEffect } from 'react';
import Selector from '@/components/Selector';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import TooltipSwitch  from '@/components/TooltipSwitch';
import Slider from '@/components/Slider';
import ErrorDisplay from '@/components/ErrorDisplay';
import MapWidget from '@/components/MapWidget';
import Tabs from '@/components/Tabs';
import MainTabs from '@/components/MainTabs';
import { validateCoordinates } from '@/api/preprocess';
import { useDTMProviders } from '@/hooks/useDTMProviders';
import { useBackendVersion } from '@/hooks/useBackendVersion';
import config from '@/app/config';
import logger from '@/utils/logger';
import { 
  gameOptions, 
  createSizeOptions, 
  defaultValues, 
} from '@/config/validation';
import ButtonProgress from '@/components/ButtonProgress';
import { useMapGeneration } from '@/hooks/useMapGeneration';
import DemSettingsContent from '@/app/settings/demSettings';
import BackgroundSettingsContent from '@/app/settings/backgroundSettings';
import GrleSettingsContent from '@/app/settings/grleSettings';
import I3dSettingsContent from '@/app/settings/i3dSettings';
import TextureSettingsContent from '@/app/settings/textureSettings';
import SatelliteSettingsContent from '@/app/settings/satelliteSettings';

const isPublicVersion = config.isPublicVersion;
const backendUrl = config.backendUrl;
logger.info(`Running in public version: ${isPublicVersion}. Backend URL: ${backendUrl}`);
logger.info(`Public hostname: ${config.publicHostName}`);

// Backend version constant - will be set after backend connectivity is confirmed
let backendVersion = null;

export default function Home() {
  const [selectedGame, setSelectedGame] = useState(defaultValues.game);
  const [coordinatesInput, setCoordinatesInput] = useState(defaultValues.coordinates);
  const [selectedSize, setSelectedSize] = useState(defaultValues.size);
  const [customSize, setCustomSize] = useState(defaultValues.customSize);
  const [outputSize, setOutputSize] = useState(defaultValues.outputSize);
  const [rotation, setRotation] = useState(defaultValues.rotation);

  const [onlyPopularSettings, setOnlyPopularSettings] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState('generator');

  // DTM provider state managed by custom hook
  const { 
    dtmOptions, 
    selectedDTMProvider, 
    setSelectedDTMProvider, 
    dtmLoading, 
    dtmError 
  } = useDTMProviders(coordinatesInput);

  // Backend version and connectivity check
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

  // Create size options based on version
  const sizeOptions = createSizeOptions(isPublicVersion);
  
  // Get settings content and values.
  const { content: demContent, values: demValues } = DemSettingsContent(!onlyPopularSettings);
  const { content: backgroundContent, values: backgroundValues } = BackgroundSettingsContent(!onlyPopularSettings, config.isPublicVersion);
  const { content: grleContent, values: grleValues } = GrleSettingsContent(!onlyPopularSettings);
  const { content: i3dContent, values: i3dValues } = I3dSettingsContent(!onlyPopularSettings);
  const { content: textureContent, values: textureValues } = TextureSettingsContent(!onlyPopularSettings, config.isPublicVersion);
  const { content: satelliteContent, values: satelliteValues } = SatelliteSettingsContent(!onlyPopularSettings, config.isPublicVersion);

      // Map generation state
  const {
    statusType,
    statusText,
    progress,
    isDownloadMode,
    isGenerating,
    error,
    startGeneration,
    downloadMap,
    resetGeneration,
    cleanup
  } = useMapGeneration();

  // Check if generate button should be enabled
  const isGenerateEnabled = validateCoordinates(coordinatesInput) && !isGenerating;

  // Compute display status based on form state
  const displayStatusText = !isGenerateEnabled && statusText === "Ready" 
    ? "Enter valid coordinates, check the settings and click Generate map."
    : statusText === "Ready" && isGenerateEnabled 
    ? "Click Generate map to start the generation process."
    : statusText;

  // Define tabs
  const tabs = [
    {
      id: 'generator',
      label: 'Map Generator',
      icon: <i className="zmdi zmdi-landscape"></i>
    },
    {
      id: 'my-maps',
      label: 'My Maps [BETA]',
      icon: <i className="zmdi zmdi-collection-folder-image"></i>
    }
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
        <i className="zmdi zmdi-github text-xl"></i>
      </a>
      <a
        href="https://www.youtube.com/@maps4fs"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
        title="YouTube Channel"
      >
        <i className="zmdi zmdi-youtube-play text-xl"></i>
      </a>
      <a
        href="https://discord.gg/Sj5QKKyE42"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
        title="Discord Server"
      >
        <i className="zmdi zmdi-comments text-xl"></i>
      </a>
    </>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Main Navigation Header */}
      <MainTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rightContent={rightNavLinks}
      />

      {/* Tab Content */}
      {activeTab === 'generator' && (
        <div className="flex">
          {/* Left Panel */}
          <div className="w-1/2 p-8 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Game Selector */}
        <Selector
          label="Game Version"
          options={gameOptions}
          value={selectedGame}
          onChange={setSelectedGame}
          placeholder="Choose your game version..."
          labelWidth='w-40'
          tooltip="Game for which map should be generated. Note, that some features may not be available in all versions."
          size="sm"
        />

        {/* Coordinates Input */}
        <TextInput
          label="Coordinates"
          value={coordinatesInput}
          onChange={setCoordinatesInput}
          placeholder="45.26, 19.79"
          labelWidth='w-40'
          validator={validateCoordinates}
          errorMessage="Enter valid coordinates (latitude, longitude) separated by comma or space. Example: 45.26, 19.79"
          tooltip="Coordinates of the center point of the map in decimal latitude and longitude."
          size="sm"
        />

        {/* DTM Provider Selector */}
        <Selector
          label="DTM Provider"
          options={dtmOptions}
          value={selectedDTMProvider}
          onChange={setSelectedDTMProvider}
          placeholder={dtmLoading ? "Loading providers..." : "Choose DTM provider..."}
          labelWidth='w-40'
          tooltip="Digital Terrain Model provider for elevation data. Different providers offer varying resolution and coverage."
          size="sm"
          disabled={dtmLoading}
        />

        {/* DTM Error Display */}
        <ErrorDisplay 
          error={dtmError}
          title="Failed to load DTM providers"
        />

        {/* Map Size Selector */}
        <Selector
          label="Map Size"
          options={sizeOptions}
          value={selectedSize}
          onChange={setSelectedSize}
          placeholder="Choose your map size..."
          labelWidth='w-40'
          tooltip="Represents the real-world area your map will cover, measured in meters."
          size="sm"
        />

        {selectedSize === "custom" && (
          <>
            <NumberInput
              label="Custom Size"
              value={customSize}
              onChange={setCustomSize}
              min={1}
              max={50000}
              step={1}
              labelWidth='w-40'
              tooltip="Size of the map in meters. Note, that Giants Editor requires map dimensions to be powers of 2."
              size="sm"
            />

            <NumberInput
              label="Output Size"
              value={outputSize}
              onChange={setOutputSize}
              min={1}
              max={50000}
              step={1}
              labelWidth='w-40'
              tooltip="Real-world map area will be scaled to match the selected in-game size."
              size="sm"
            />
          </>
        )}

        {/* Map Rotation Slider */}
        <Slider
          label="Map Rotation"
          value={rotation}
          onChange={setRotation}
          min={-90}
          max={90}
          step={1}
          labelWidth='w-40'
          tooltip="Rotate the map clockwise in degrees. 0° = North up, positive values rotate clockwise, negative values rotate counterclockwise."
          size="sm"
        />
        <TooltipSwitch
          label="Show only popular settings"
          description='Disable to show all generation settings, leave enabled to show only popular settings.'
          value={onlyPopularSettings}
          onChange={setOnlyPopularSettings}
          size="sm"
        />

        {demContent}
        {backgroundContent}
        {grleContent}
        {i3dContent}
        {textureContent}
        {satelliteContent}

        {/* Generate/Download Button */}
        <ButtonProgress
          label="Generate map"
          downloadLabel="Download map"
          onClick={() => {
            // Collect all form data
            const settings = {
              mainSettings: {
                gameCode: selectedGame,
                coordinates: coordinatesInput,
                dtmCode: selectedDTMProvider,
                size: selectedSize === "custom" ? customSize : selectedSize,
                rotation: rotation,
                outputSize: null, // Will be set later if needed
              },
              generationSettings: {
                dem_settings: demValues,
                background_settings: backgroundValues,
                i3d_settings: i3dValues,
                grle_settings: grleValues,
                texture_settings: textureValues,
                satellite_settings: satelliteValues,
              },
            };
            startGeneration(settings);
          }}
          onDownload={downloadMap}
          disabled={!isGenerateEnabled}
          statusType={statusType}
          statusText={displayStatusText}
          progress={progress}
          isDownloadMode={isDownloadMode}
          error={error}
          labelWidth='w-40'
          size="sm"
        />
      </div>

      {/* Right Panel */}
      <div className="w-1/2 p-8">
        {isBackendAvailable === false ? (
          /* Backend Unavailable Message */
          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 opacity-20">
              <img 
                src="https://github.com/iwatkot/maps4fs/releases/download/2.1.2/502.jpg"
                alt="Maps4FS Preview"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">Backend Service Unavailable</div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  Unable to connect to the backend server. Make sure the server is running and accessible.
                </div>
                {backendError && (
                  <div className="text-sm bg-gray-200 dark:bg-gray-700 p-3 rounded-lg border border-gray-300 dark:border-gray-600">
                    <strong>Technical Details:</strong> <span className="font-mono text-xs break-words">{backendError}</span>
                  </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Please check if the backend service is running or try again later.
                </div>
              </div>
            </div>
          </div>
        ) : isBackendAvailable === null ? (
          /* Loading Backend Status */
          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400 space-y-2">
              <div className="text-2xl animate-spin">⏳</div>
              <div className="text-lg font-medium">Checking Backend Connection</div>
              <div className="text-sm">Connecting to backend service...</div>
            </div>
          </div>
        ) : validateCoordinates(coordinatesInput) ? (
          <MapWidget 
            coordinates={coordinatesInput}
            onCoordinatesChange={setCoordinatesInput}
            size={selectedSize === "custom" ? customSize : selectedSize}
            rotation={rotation}
            onRotationChange={setRotation}
            onSizeChange={setCustomSize}
            showResizeHandle={selectedSize === "custom"}
          />
        ) : (
          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400 space-y-2">
              <div className="text-2xl">🗺️</div>
              <div className="text-lg font-medium">Map Preview</div>
              <div className="text-sm max-w-sm">
                Enter valid coordinates in the left panel to see your map preview here
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      )}

      {activeTab === 'my-maps' && (
        <div className="flex">
          {/* My Maps Content - Empty for now */}
          <div className="w-full p-8">
            <div className="text-center text-gray-500 dark:text-gray-400 space-y-4">
              <i className="zmdi zmdi-collection-folder-image text-6xl"></i>
              <div className="text-2xl font-medium">My Maps</div>
              <div className="text-lg">Coming soon - Your saved maps will appear here</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
