'use client';

import { useState, useEffect, useCallback } from 'react';
import Selector from '@/components/Selector';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import TooltipSwitch  from '@/components/TooltipSwitch';
import Slider from '@/components/Slider';
import ErrorDisplay from '@/components/ErrorDisplay';
import MapWidget from '@/components/MapWidget';
import PageNavigator from '@/components/PageNavigator';
import SlideNavigator from '@/components/SlideNavigator';
import PreviewGallery from '@/components/PreviewGallery';
import DataSourceSelector, { DATA_SOURCES } from '@/components/DataSourceSelector';
import { validateCoordinates } from '@/api/preprocess';
import { useDTMProviders } from '@/hooks/useDTMProviders';
import config from '@/app/config';
import logger from '@/utils/logger';
import { 
  gameOptions, 
  createSizeOptions, 
  defaultValues,
  constraints,
  getMaxCustomSize,
  getMaxOutputSize,
} from '@/config/validation';
import ButtonProgress from '@/components/ButtonProgress';
import MixedPreviewGallery from '@/components/MixedPreviewGallery';
import { useMapGeneration } from '@/hooks/useMapGeneration';
import { useDefaultTemplates } from '@/hooks/useDefaultTemplates';
import { separateFilesByType } from '@/utils/fileTypeUtils';
import DemSettingsContent from '@/app/settings/demSettings';
import BackgroundSettingsContent from '@/app/settings/backgroundSettings';
import GrleSettingsContent from '@/app/settings/grleSettings';
import I3dSettingsContent from '@/app/settings/i3dSettings';
import TextureSettingsContent from '@/app/settings/textureSettings';
import SatelliteSettingsContent from '@/app/settings/satelliteSettings';
import PresetSelector from '@/components/PresetSelector';
import apiService from '@/utils/apiService';

const isPublicVersion = config.isPublicVersion;
const backendUrl = config.backendUrl;
logger.info(`Running in public version: ${isPublicVersion}. Backend URL: ${backendUrl}`);

/**
 * Format field key to human-readable label
 * @param {string} key - The field key
 * @returns {string} - Formatted label
 */
function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

export default function GeneratorTab({ 
  backendVersion: currentBackendVersion, 
  isBackendAvailable, 
  backendError,
  isPublicVersion,
  duplicateMapData,
  onDuplicateDataProcessed
}) {
  const [selectedGame, setSelectedGame] = useState(defaultValues.game);
  const [coordinatesInput, setCoordinatesInput] = useState(defaultValues.coordinates);
  const [selectedSize, setSelectedSize] = useState(defaultValues.size);
  const [customSize, setCustomSize] = useState(defaultValues.customSize);
  const [outputSize, setOutputSize] = useState(defaultValues.outputSize);
  const [rotation, setRotation] = useState(defaultValues.rotation);
  const [onlyPopularSettings, setOnlyPopularSettings] = useState(true);
  
  // Page navigation state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);
  const PAGES = {
    MAP: 0,
    PREVIEWS_START: 1
  };

  // OSM file upload state
  const [dataSource, setDataSource] = useState(DATA_SOURCES.PUBLIC);
  const [selectedOsmFile, setSelectedOsmFile] = useState(null);
  const [osmData, setOsmData] = useState(null);

  // State for pending DTM provider from duplication
  const [pendingDTMProvider, setPendingDTMProvider] = useState(null);

  // State for pending generation settings from duplication
  const [pendingGenerationSettings, setPendingGenerationSettings] = useState(null);

  // State for preset management
  const [presetsDisabled, setPresetsDisabled] = useState(false);
  const [presetDisableReason, setPresetDisableReason] = useState('');
  
  // State for selected preset files (OSM and DEM)
  const [selectedOsmPreset, setSelectedOsmPreset] = useState(null);
  const [selectedDemPreset, setSelectedDemPreset] = useState(null);

    // State for queue management (public version only)
  const [queueSize, setQueueSize] = useState(0);
  const [isQueueOverloaded, setIsQueueOverloaded] = useState(false);
  const [queueCheckError, setQueueCheckError] = useState(false);
  const [isCheckingQueue, setIsCheckingQueue] = useState(false);
  const [isInitialQueueCheck, setIsInitialQueueCheck] = useState(true);
  const QUEUE_LIMIT = 10; // Hardcoded limit for public version

  // State for managing closable sections - avoid hydration mismatch
  const [showIntro, setShowIntro] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting and localStorage check
  useEffect(() => {
    setIsClient(true);
    const closedIntro = localStorage.getItem('maps4fs-intro-closed');
    if (closedIntro === 'true') {
      setShowIntro(false);
    }
  }, []);

  // Manage initial queue check state based on props
  useEffect(() => {
    console.log('Managing initial queue check state:', { isPublicVersion, isBackendAvailable });
    if (!isPublicVersion) {
      // For local version, no need for overlay
      console.log('Setting isInitialQueueCheck to false (local version)');
      setIsInitialQueueCheck(false);
    } else {
      // For public version, show overlay immediately until queue check completes
      console.log('Setting isInitialQueueCheck to true (public version)');
      setIsInitialQueueCheck(true);
    }
  }, [isPublicVersion, isBackendAvailable]);

  // Handler to close intro and save to localStorage
  const handleCloseIntro = () => {
    setShowIntro(false);
    localStorage.setItem('maps4fs-intro-closed', 'true');
  };

  // Function to check queue size (public version only)
  const checkQueueSize = useCallback(async () => {
    if (!isPublicVersion || !isBackendAvailable) {
      return;
    }

    setIsCheckingQueue(true);
    try {
      // Add minimum delay for smooth UX
      const [queueResult] = await Promise.all([
        apiService.getQueueSize(),
        new Promise(resolve => setTimeout(resolve, 500)) // Minimum 500ms for smooth animation
      ]);
      
      setQueueSize(queueResult);
      setIsQueueOverloaded(queueResult >= QUEUE_LIMIT);
      setQueueCheckError(false);
      console.log(`Queue size: ${queueResult}/${QUEUE_LIMIT}`);
    } catch (error) {
      console.error('Failed to check queue size:', error);
      setQueueCheckError(true);
      // Don't block on error - assume not overloaded
      setIsQueueOverloaded(false);
      
      // Add delay even for error case to prevent glitch
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsCheckingQueue(false);
      console.log('Queue check completed, setting isInitialQueueCheck to false');
      setIsInitialQueueCheck(false); // Mark initial check as complete
    }
  }, [isPublicVersion, isBackendAvailable]);

  // Check queue size periodically for public version
  useEffect(() => {
    if (!isPublicVersion || !isBackendAvailable) {
      return;
    }

    // Initial check
    checkQueueSize();

    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkQueueSize, 30000);
    
    return () => clearInterval(interval);
  }, [isPublicVersion, isBackendAvailable, checkQueueSize]);

  // OSM file handlers
  const handleDataSourceChange = (source) => {
    setDataSource(source);
    logger.info(`Data source changed to: ${source}`);
  };

  const handleOsmFileSelect = (file) => {
    setSelectedOsmFile(file);
    logger.info(`OSM file selected: ${file.name} (${file.size} bytes)`);
  };

  const handleOsmFileRemove = () => {
    setSelectedOsmFile(null);
    setOsmData(null);
    setDataSource(DATA_SOURCES.PUBLIC);
    logger.info('OSM file removed, switched back to public data source');
  };

  const handleOsmDataProcessed = (processedData) => {
    setOsmData(processedData);
    if (processedData) {
      logger.info(`OSM data processed: ${processedData.featureCount} features`);
    }
  };

  // DTM provider state managed by custom hook
  const { 
    dtmOptions, 
    selectedDTMProvider, 
    setSelectedDTMProvider, 
    dtmLoading, 
    dtmError,
    providerInfo,
    dtmSettings,
    setDtmSettings
  } = useDTMProviders(coordinatesInput);

  // Handle map duplication data
  useEffect(() => {
    if (duplicateMapData && onDuplicateDataProcessed) {
      // Disable presets when duplicate map is being processed
      setPresetsDisabled(true);
      setPresetDisableReason('Map duplication in progress - presets disabled');
      
      // Clear any selected preset files
      setSelectedOsmPreset(null);
      setSelectedDemPreset(null);
      
      const { mainSettings, generationSettings, customOsm } = duplicateMapData;
      
      // Populate form fields from main settings
      if (mainSettings) {
        // Set game - convert FS25 -> fs25, FS22 -> fs22
        const gameValue = mainSettings.game?.toLowerCase() || defaultValues.game;
        setSelectedGame(gameValue);
        
        setCoordinatesInput(`${mainSettings.latitude}, ${mainSettings.longitude}`);
        
        // Set size - check if it's a standard size or custom
        const standardSizes = [2048, 4096, 8192, 16384];
        if (standardSizes.includes(mainSettings.size)) {
          setSelectedSize(mainSettings.size);
        } else {
          // Custom size
          setSelectedSize("custom");
          setCustomSize(mainSettings.size);
        }
        
        if (mainSettings.output_size) {
          setOutputSize(mainSettings.output_size);
        }
        setRotation(mainSettings.rotation || defaultValues.rotation);
        
        // Store DTM provider to be set after options are loaded
        if (mainSettings.dtm_provider) {
          console.log('Storing pending DTM provider from duplication:', mainSettings.dtm_provider);
          setPendingDTMProvider(mainSettings.dtm_provider);
        }
      }
      
      // Handle custom OSM file if available
      if (customOsm) {
        // Create a File object from the OSM content
        const osmBlob = new Blob([customOsm.content], { type: 'application/xml' });
        const osmFile = new File([osmBlob], customOsm.fileName, { type: 'application/xml' });
        
        console.log('Setting custom OSM file from duplication:', osmFile.name, osmFile.size);
        setDataSource(DATA_SOURCES.CUSTOM);
        setSelectedOsmFile(osmFile);
        
        // Process the OSM file to extract map data for the MapWidget
        const processOsmData = async () => {
          try {
            const { processOsmFile } = await import('@/utils/osmUtils');
            const processedData = await processOsmFile(osmFile);
            processedData.timestamp = Date.now(); // Add timestamp for cache busting
            setOsmData(processedData);
            console.log('OSM data processed from duplication:', processedData.featureCount, 'features');
          } catch (error) {
            console.error('Error processing duplicated OSM file:', error);
          }
        };
        
        processOsmData();
      }
      
      // Handle generation settings - duplicate map has highest priority
      if (generationSettings) {
        console.log('Storing pending generation settings from duplication:', generationSettings);
        console.log('Generation settings keys:', Object.keys(generationSettings));
        // Clear any existing generation settings and apply from duplication
        setPendingGenerationSettings(generationSettings);
      }
      
      // Mark as processed
      onDuplicateDataProcessed();
    }
  }, [duplicateMapData, onDuplicateDataProcessed, setSelectedDTMProvider]);

  // Function to clear all presets (used when duplicating map)
  const clearAllPresets = () => {
    // Clear preset selections in PresetSelector components
    // This will be handled by passing a reset flag to the components
    console.log('Clearing all preset selections due to map duplication');
  };

  // Function to re-enable presets
  const enablePresets = () => {
    setPresetsDisabled(false);
    setPresetDisableReason('');
    // Don't clear preset selections when re-enabling, let user choose
    console.log('Presets re-enabled');
  };

  // Function to apply generation settings preset
  const applyGenerationSettingsPreset = (presetData) => {
    console.log('Applying generation settings preset:', presetData);
    
    try {
      // Check if presets are disabled (e.g., due to duplicate map processing)
      if (presetsDisabled) {
        console.log('Presets are disabled, skipping generation settings preset application');
        return;
      }
      
      // Store the generation settings - the existing logic will handle applying them
      setPendingGenerationSettings(presetData);
      console.log('Generation settings preset applied, keys:', Object.keys(presetData));
    } catch (error) {
      console.error('Error applying generation settings preset:', error);
    }
  };

  // Function to apply OSM preset
  const applyOsmPreset = (presetFile) => {
    console.log('Applying OSM preset:', presetFile);
    
    try {
      // Check if presets are disabled (e.g., due to duplicate map processing)
      if (presetsDisabled) {
        console.log('Presets are disabled, skipping OSM preset application');
        return;
      }
      
      // Store the selected OSM preset file info
      setSelectedOsmPreset(presetFile);
      console.log('OSM preset selected:', presetFile.name);
    } catch (error) {
      console.error('Error applying OSM preset:', error);
    }
  };

  // Function to apply DEM preset
  const applyDemPreset = (presetFile) => {
    console.log('Applying DEM preset:', presetFile);
    
    try {
      // Check if presets are disabled (e.g., due to duplicate map processing)
      if (presetsDisabled) {
        console.log('Presets are disabled, skipping DEM preset application');
        return;
      }
      
      // Store the selected DEM preset file info
      setSelectedDemPreset(presetFile);
      console.log('DEM preset selected:', presetFile.name);
    } catch (error) {
      console.error('Error applying DEM preset:', error);
    }
  };

  // Function to apply main settings preset
  const applyMainSettingsPreset = (presetData) => {
    console.log('Applying main settings preset:', presetData);
    
    try {
      // Check if presets are disabled (e.g., due to duplicate map processing)
      if (presetsDisabled) {
        console.log('Presets are disabled, skipping main settings preset application');
        return;
      }
      // 1. Game Version - convert uppercase to lowercase (FS25 -> fs25, FS22 -> fs22)
      if (presetData.game) {
        const gameValue = presetData.game.toLowerCase();
        setSelectedGame(gameValue);
        console.log('Set game to:', gameValue);
      }
      
      // 2. Coordinates - combine latitude and longitude into string format
      if (presetData.latitude !== undefined && presetData.longitude !== undefined) {
        const coordsString = `${presetData.latitude}, ${presetData.longitude}`;
        setCoordinatesInput(coordsString);
        console.log('Set coordinates to:', coordsString);
      }
      
      // 3. Map Size - check if standard size or custom
      if (presetData.size) {
        const standardSizes = [2048, 4096, 8192, 16384];
        if (standardSizes.includes(presetData.size)) {
          setSelectedSize(presetData.size);
          console.log('Set standard size to:', presetData.size);
        } else {
          // Custom size
          setSelectedSize("custom");
          setCustomSize(presetData.size);
          console.log('Set custom size to:', presetData.size);
        }
      }
      
      // 4. Output Size
      if (presetData.output_size) {
        setOutputSize(presetData.output_size);
        console.log('Set output size to:', presetData.output_size);
      }
      
      // 5. Rotation
      if (presetData.rotation !== undefined) {
        setRotation(presetData.rotation);
        console.log('Set rotation to:', presetData.rotation);
      }
      
      // 6. DTM Provider - store for later application when options are loaded
      if (presetData.dtm_provider) {
        console.log('Storing pending DTM provider from preset:', presetData.dtm_provider);
        setPendingDTMProvider(presetData.dtm_provider);
      }
      
    } catch (error) {
      console.error('Error applying main settings preset:', error);
    }
  };

  // Set pending DTM provider when options are loaded
  useEffect(() => {
    if (pendingDTMProvider && dtmOptions && dtmOptions.length > 0 && !dtmLoading) {
      console.log('Attempting to set DTM provider by label:', pendingDTMProvider);
      console.log('Available DTM options:', dtmOptions.map(opt => ({ label: opt.label, value: opt.value })));
      
      // Search by label since the JSON stores the provider name/label
      const providerByLabel = dtmOptions.find(option => option.label === pendingDTMProvider);
      
      if (providerByLabel) {
        console.log('Found provider by label:', providerByLabel);
        setSelectedDTMProvider(providerByLabel.value);
        setPendingDTMProvider(null); // Clear the pending provider
      } else {
        console.log('Provider not found by exact label, checking for partial matches...');
        // Try to find a partial match in case of slight differences
        const partialMatch = dtmOptions.find(option => 
          option.label.toLowerCase().includes(pendingDTMProvider.toLowerCase()) ||
          pendingDTMProvider.toLowerCase().includes(option.label.toLowerCase())
        );
        if (partialMatch) {
          console.log('Found partial match:', partialMatch);
          setSelectedDTMProvider(partialMatch.value);
          setPendingDTMProvider(null);
        } else {
          console.log('No match found for DTM provider:', pendingDTMProvider);
        }
      }
    }
  }, [pendingDTMProvider, dtmOptions, dtmLoading, setSelectedDTMProvider]);

  // Create size options based on version
  const sizeOptions = createSizeOptions(isPublicVersion);
  
  // Get settings content and values - use empty object initially, then actual settings when available
  const demSettings = pendingGenerationSettings?.DEMSettings || {};
  const backgroundSettings = pendingGenerationSettings?.BackgroundSettings || {};
  const grleSettings = pendingGenerationSettings?.GRLESettings || {};
  const i3dSettings = pendingGenerationSettings?.I3DSettings || {};
  const textureSettings = pendingGenerationSettings?.TextureSettings || {};
  const satelliteSettings = pendingGenerationSettings?.SatelliteSettings || {};

  const { content: demContent, values: demValues } = DemSettingsContent(!onlyPopularSettings, demSettings);
  const { content: backgroundContent, values: backgroundValues } = BackgroundSettingsContent(!onlyPopularSettings, config.isPublicVersion, backgroundSettings);
  const { content: grleContent, values: grleValues } = GrleSettingsContent(!onlyPopularSettings, false, grleSettings);
  const { content: i3dContent, values: i3dValues } = I3dSettingsContent(!onlyPopularSettings, false, i3dSettings);
  const { content: textureContent, values: textureValues } = TextureSettingsContent(!onlyPopularSettings, false, textureSettings);
  const { content: satelliteContent, values: satelliteValues } = SatelliteSettingsContent(!onlyPopularSettings, config.isPublicVersion, satelliteSettings);

  // Apply pending generation settings from duplication
  useEffect(() => {
    if (pendingGenerationSettings) {
      console.log('Generation settings applied to components:', pendingGenerationSettings);
      
      // Clear the pending settings after a short delay to allow components to initialize
      setTimeout(() => {
        setPendingGenerationSettings(null);
      }, 100);
    }
  }, [pendingGenerationSettings]);

  // Map generation state managed by custom hook
  const { 
    statusType,
    statusText, 
    isGenerating, 
    progress,
    isDownloadMode,
    error,
    taskId,
    previews,
    previewsError,
    startGeneration,
    downloadMap
  } = useMapGeneration();

  // Template management (only for public version)
  const { getTemplatePayload, hasTemplates, getTemplateSummary } = useDefaultTemplates(selectedGame);

  // Check if generate button should be enabled
  const isGenerateEnabled = validateCoordinates(coordinatesInput) && !isGenerating;
  
  // Determine pages based on available content
  const { pngPreviews, stlModels } = separateFilesByType(previews);
  const hasPngPreviews = pngPreviews && pngPreviews.length > 0;
  const hasStlModels = stlModels && stlModels.length > 0;
  const showPreviewsPage = hasPngPreviews || hasStlModels;
  
  // Calculate total pages: Map page (1) + Preview pages (1 for PNG gallery + 1 per STL)
  const previewPages = (hasPngPreviews ? 1 : 0) + (stlModels ? stlModels.length : 0);
  const totalPages = showPreviewsPage ? 1 + previewPages : 1;
  const pageLabels = ['Map Preview', ...(showPreviewsPage ? ['Generated Previews'] : [])];
  
  // Helper function to check if current page is a preview page
  const isPreviewPage = (page) => showPreviewsPage && page >= PAGES.PREVIEWS_START;
  
  // Auto-switch to previews page when they become available (only once)
  useEffect(() => {
    if (showPreviewsPage && !hasAutoSwitched) {
      setCurrentPage(PAGES.PREVIEWS_START);
      setHasAutoSwitched(true);
    }
    
    // Reset auto-switch flag when previews are no longer available (new generation started)
    if (!showPreviewsPage && hasAutoSwitched) {
      setHasAutoSwitched(false);
    }
  }, [showPreviewsPage, hasAutoSwitched, PAGES.PREVIEWS_START]);

  // Compute display status based on form state
  const displayStatusText = !isGenerateEnabled && statusText === "Ready" 
    ? "Enter valid coordinates, check the settings and click Generate map."
    : statusText === "Ready" && isGenerateEnabled 
    ? "Click Generate map to start the generation process."
    : statusText;

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-1/2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col relative">
        
        {/* Initial Queue Check Overlay - Only for public version */}
        {(() => {
          const shouldShowOverlay = isPublicVersion && isInitialQueueCheck;
          console.log('Overlay render check:', { isPublicVersion, isBackendAvailable, isInitialQueueCheck, shouldShowOverlay });
          return shouldShowOverlay;
        })() && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl border border-gray-200 dark:border-gray-600">
              <div className="mb-4">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {isBackendAvailable ? 'Checking Server Queue' : 'Connecting to Server'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isBackendAvailable 
                  ? 'Checking server queue status...' 
                  : 'Establishing connection to server...'}
              </p>
            </div>
          </div>
        )}

        {/* Queue Overload Overlay - Only for public version and not when user is already generating */}
        {isPublicVersion && isQueueOverloaded && !isGenerating && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl border border-gray-200 dark:border-gray-600">
              <div className="mb-4">
                <i className="zmdi zmdi-time text-4xl text-orange-500"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Server Overloaded
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The server is currently processing <span className="font-semibold text-orange-600">{queueSize}</span> maps. 
                Please try again later or consider running locally for immediate processing.
              </p>
              <div className="space-y-3">
                <button
                  onClick={checkQueueSize}
                  disabled={isCheckingQueue}
                  className={`w-full px-4 py-2 text-white rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center transform ${
                    isCheckingQueue 
                      ? 'bg-gray-400 cursor-not-allowed scale-95' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
                  }`}
                >
                  <div className={`flex items-center transition-all duration-300 ${isCheckingQueue ? 'opacity-100' : 'opacity-100'}`}>
                    {isCheckingQueue ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full transition-all duration-300"></div>
                        <span className="transition-all duration-300">Checking...</span>
                      </>
                    ) : (
                      <>
                        <i className="zmdi zmdi-refresh mr-2 transition-all duration-300"></i>
                        <span className="transition-all duration-300">Check Again</span>
                      </>
                    )}
                  </div>
                </button>
                <a
                  href="https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <i className="zmdi zmdi-download mr-2"></i>
                  Run Locally
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Queue limit: {QUEUE_LIMIT} • Current: {queueSize}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Scrollable Settings Area */}
        <div className="flex-1 overflow-y-auto p-8">
        
        {/* Informational Intro - Closable */}
        {isClient && showIntro && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg relative">
            {/* Close button */}
            <button
              onClick={handleCloseIntro}
              className="absolute top-2 right-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-lg leading-none p-1"
              title="Close intro"
            >
              <i className="zmdi zmdi-close text-sm"></i>
            </button>
            
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 pr-6">
              Maps4FS - Farming Simulator Map Generator
            </h3>
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed mb-3">
            This tool creates map templates for Farming Simulator using real-world geographic data from <a href="https://www.openstreetmap.org">OpenStreetMap</a> and various <a href="https://github.com/iwatkot/pydtmdl">DTM Providers</a>. Templates provide a foundation for map creation in Giants Editor - they are not playable maps.
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
            New to map making? Check out {' '}
            <a 
              href="https://maps4fs.gitbook.io/docs/getting-started/step_by_step_guide" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600 dark:hover:text-blue-200 font-medium"
            >
              step-by-step guide
            </a>
            {' '}and{' '}
            <a 
              href="https://www.youtube.com/watch?v=hPbJZ0HoiDE&list=PLug0g7UYHX8D1Jik6NkJjQhdxqS-NOtB9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600 dark:hover:text-blue-200 font-medium"
            >
              video tutorials
            </a>
            .
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            Something missing or incorrect? Data comes from OpenStreetMap - you can contribute improvements there.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <a 
              href="https://maps4fs.gitbook.io/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              <i className="zmdi zmdi-book text-xs mr-1"></i>
              Documentation
            </a>
            <a 
              href="https://maps4fs.gitbook.io/docs/getting-started/faq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              <i className="zmdi zmdi-help-outline text-xs mr-1"></i>
              FAQ
            </a>
            <a 
              href="https://maps4fs.gitbook.io/docs/setup-and-installation/get_help" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              <i className="zmdi zmdi-info-outline text-xs mr-1"></i>
              Get Help
            </a>
            <a 
              href="https://discord.gg/Sj5QKKyE42" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              <i className="zmdi zmdi-comments text-xs mr-1"></i>
              Discord
            </a>
          </div>
        </div>
        )}

        {/* Preset Panel - Only show in non-public version */}
        {!isPublicVersion && (
          <div className={`border rounded-lg p-4 mb-6 ${
            presetsDisabled 
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center mb-3">
              <i className={`zmdi mr-2 ${
                presetsDisabled 
                  ? 'zmdi-alert-triangle text-yellow-600 dark:text-yellow-400' 
                  : 'zmdi-storage text-blue-600 dark:text-blue-400'
              }`}></i>
              <h3 className={`text-sm font-medium ${
                presetsDisabled 
                  ? 'text-yellow-900 dark:text-yellow-100' 
                  : 'text-blue-900 dark:text-blue-100'
              }`}>
                Quick Load Presets
              </h3>
            </div>
            
            {/* Disabled notification */}
            {presetsDisabled && (
              <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <i className="zmdi zmdi-info mr-1"></i>
                    {presetDisableReason}
                  </div>
                  <button
                    onClick={enablePresets}
                    className="px-2 py-1 bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200 text-xs rounded transition-colors"
                  >
                    Re-enable Presets
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PresetSelector
                key={`mainSettings-${presetsDisabled}`}
                type="mainSettings"
                label="Main Settings"
                icon={<i className="zmdi zmdi-settings"></i>}
                disabled={presetsDisabled}
                onPresetSelect={(preset) => {
                  if (preset && !presetsDisabled) {
                    applyMainSettingsPreset(preset);
                  }
                }}
              />
              <PresetSelector
                key={`generationSettings-${presetsDisabled}`}
                type="generationSettings"
                label="Generation Settings"
                icon={<i className="zmdi zmdi-tune"></i>}
                disabled={presetsDisabled}
                onPresetSelect={(preset) => {
                  if (preset && !presetsDisabled) {
                    applyGenerationSettingsPreset(preset);
                  }
                }}
              />
              <PresetSelector
                key={`osm-${presetsDisabled}`}
                type="osm"
                label="Custom OSM"
                icon={<i className="zmdi zmdi-map"></i>}
                disabled={presetsDisabled}
                onPresetSelect={(preset) => {
                  if (preset && !presetsDisabled) {
                    applyOsmPreset(preset);
                  } else if (!preset) {
                    // Clear OSM preset selection
                    setSelectedOsmPreset(null);
                  }
                }}
              />
              <PresetSelector
                key={`dem-${presetsDisabled}`}
                type="dem"
                label="Custom DEM"
                icon={<i className="zmdi zmdi-landscape"></i>}
                disabled={presetsDisabled}
                onPresetSelect={(preset) => {
                  if (preset && !presetsDisabled) {
                    applyDemPreset(preset);
                  } else if (!preset) {
                    // Clear DEM preset selection
                    setSelectedDemPreset(null);
                  }
                }}
              />
            </div>
          </div>
        )}



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
          placeholder="Select DTM provider..."
          labelWidth='w-40'
          tooltip="Digital Terrain Model provider for elevation data. Different providers have different coverage and resolution."
          size="sm"
          loading={dtmLoading}
          disabled={!validateCoordinates(coordinatesInput)}
        />

        {dtmError && (
          <ErrorDisplay message={dtmError} />
        )}

        {/* DTM Provider Settings - rendered inline when needed */}
        {providerInfo && providerInfo.settings_required && providerInfo.settings && (
          <div className="space-y-4">
            {Object.entries(providerInfo.settings).map(([key, setting]) => {
              if (typeof setting === 'string') {
                // String type - TextInput for API keys
                return (
                  <TextInput
                    key={`dtm-${key}`}
                    label={formatLabel(key)}
                    value={dtmSettings[key] || ''}
                    onChange={(value) => setDtmSettings(prev => ({ ...prev, [key]: value }))}
                    placeholder={`Enter ${formatLabel(key).toLowerCase()}...`}
                    labelWidth="w-40"
                    tooltip={`${formatLabel(key)} for ${providerInfo.provider}`}
                    size="sm"
                  />
                );
              } else if (typeof setting === 'object' && Array.isArray(setting)) {
                // Array/tuple type - Selector
                const options = setting.map(item => ({
                  value: item,
                  label: item,
                  description: ''
                }));
                return (
                  <Selector
                    key={`dtm-${key}`}
                    label={formatLabel(key)}
                    options={options}
                    value={dtmSettings[key] || setting[0] || ''}
                    onChange={(value) => setDtmSettings(prev => ({ ...prev, [key]: value }))}
                    placeholder={`Select ${formatLabel(key).toLowerCase()}...`}
                    labelWidth="w-40"
                    tooltip={`${formatLabel(key)} for ${providerInfo.provider}`}
                    size="sm"
                  />
                );
              } else if (typeof setting === 'object') {
                // Dict type - Selector with key-value mapping
                const options = Object.entries(setting).map(([key, label]) => ({
                  value: key,
                  label: label,
                  description: ''
                }));
                const keys = Object.keys(setting);
                return (
                  <Selector
                    key={`dtm-${key}`}
                    label={formatLabel(key)}
                    options={options}
                    value={dtmSettings[key] || keys[0] || ''}
                    onChange={(value) => setDtmSettings(prev => ({ ...prev, [key]: value }))}
                    placeholder={`Select ${formatLabel(key).toLowerCase()}...`}
                    labelWidth="w-40"
                    tooltip={`${formatLabel(key)} for ${providerInfo.provider}`}
                    size="sm"
                  />
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Size Selector */}
        <Selector
          label="Map Size"
          options={sizeOptions}
          value={selectedSize}
          onChange={setSelectedSize}
          placeholder="Choose map size..."
          labelWidth='w-40'
          tooltip="Size of the generated map. Larger maps take more time and resources to generate."
          size="sm"
        />

        {/* Custom Size Input (only if custom size selected) */}
        {selectedSize === "custom" && (
          <NumberInput
            label="Custom Size"
            value={customSize}
            onChange={setCustomSize}
            placeholder="Enter custom size"
            labelWidth='w-40'
            tooltip={`Custom map size in meters.${isPublicVersion ? ` Maximum ${getMaxCustomSize(isPublicVersion)} meters in public version.` : ''}`}
            min={1}
            max={getMaxCustomSize(isPublicVersion)}
            size="sm"
          />
        )}

        {/* Output Size (only if custom size selected) */}
        {selectedSize === "custom" && (
          <NumberInput
            label="Output Size"
            value={outputSize}
            onChange={setOutputSize}
            placeholder="Enter output size"
            labelWidth='w-40'
            tooltip={`Output size in pixels. Note that when downgrading the map size, some details may be lost.${isPublicVersion ? ` Maximum ${getMaxOutputSize(isPublicVersion)} pixels in public version.` : ''}`}
            min={1}
            max={getMaxOutputSize(isPublicVersion)}
            size="sm"
          />
        )}

        {/* Rotation Slider */}
        <Slider
          label="Rotation"
          value={rotation}
          onChange={setRotation}
          min={constraints.rotation.min}
          max={constraints.rotation.max}
          step={1}
          labelWidth='w-40'
          tooltip="Rotation angle of the map in degrees. 0 means north is up."
          size="sm"
        />

        {/* Toggle Popular Settings */}
        <TooltipSwitch
          label="Show only popular"
          description="Show only the most commonly used settings to simplify the interface."
          value={onlyPopularSettings}
          onChange={setOnlyPopularSettings}
          size="sm"
        />

        {/* Settings Sections */}
        {demContent}
        {backgroundContent}
        {grleContent}
        {i3dContent}
        {textureContent}
        {satelliteContent}
        </div>

        {/* Fixed Generate Button at Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
          {/* Template Indicator (only for non-public version) */}
          {!config.isPublicVersion && hasTemplates() && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center">
                <i className="zmdi zmdi-settings text-blue-600 dark:text-blue-400 mr-2"></i>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Using Custom Templates:
                </span>
              </div>
              <div className="mt-1 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                {getTemplateSummary().map((template, index) => (
                  <div key={index}>• {template}</div>
                ))}
              </div>
            </div>
          )}
          
          <ButtonProgress
            label="Generate map"
            downloadLabel="Download map"
            onClick={() => {
              // Collect all form data
              const mainSettings = {
                gameCode: selectedGame,
                coordinates: coordinatesInput,
                dtmCode: selectedDTMProvider,
                size: selectedSize === "custom" ? customSize : selectedSize,
                rotation: rotation,
              };

              // Only include outputSize when custom size is selected
              if (selectedSize === "custom") {
                mainSettings.outputSize = outputSize;
              }

              // Validate size limits for public version
              if (isPublicVersion) {
                const maxCustomSize = getMaxCustomSize(isPublicVersion);
                const maxOutputSize = getMaxOutputSize(isPublicVersion);
                
                // Check custom size limit
                if (selectedSize === "custom" && customSize > maxCustomSize) {
                  alert(`Custom size cannot exceed ${maxCustomSize} meters in the public version.`);
                  return;
                }
                
                // Check output size limit
                if (selectedSize === "custom" && outputSize > maxOutputSize) {
                  alert(`Output size cannot exceed ${maxOutputSize} pixels in the public version.`);
                  return;
                }
              }

              // Add DTM settings if provider requires them
              if (providerInfo && providerInfo.settings_required) {
                mainSettings.dtm_settings = dtmSettings;
              }

              // Add preset file paths if selected
              if (selectedOsmPreset) {
                mainSettings.custom_osm_path = selectedOsmPreset.name;
                console.log('Including OSM preset in payload:', selectedOsmPreset.name);
              }

              if (selectedDemPreset) {
                mainSettings.custom_dem_path = selectedDemPreset.name;
                console.log('Including DEM preset in payload:', selectedDemPreset.name);
              }

              const settings = {
                mainSettings,
                generationSettings: {
                  dem_settings: demValues,
                  background_settings: backgroundValues,
                  i3d_settings: i3dValues,
                  grle_settings: grleValues,
                  texture_settings: textureValues,
                  satellite_settings: satelliteValues,
                },
              };
              
              // Pass custom OSM data if using custom data source
              const customOsmData = dataSource === DATA_SOURCES.CUSTOM ? osmData : null;
              
              // Get template payload for non-public version
              const templatePayload = !config.isPublicVersion ? getTemplatePayload() : null;
              
              startGeneration(settings, customOsmData, templatePayload);
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
      </div>

      {/* Right Panel */}
      <div className="w-1/2 p-8 flex flex-col">
        {/* Data Source Selector */}
        <div className="mb-6">
          <DataSourceSelector
            selectedSource={dataSource}
            onSourceChange={handleDataSourceChange}
            selectedFile={selectedOsmFile}
            onFileSelect={handleOsmFileSelect}
            onFileRemove={handleOsmFileRemove}
            onOsmDataProcessed={handleOsmDataProcessed}
            disabled={isBackendAvailable === false}
          />
        </div>

        {/* Page Content Area - with relative positioning for overlay navigation */}
        <div className="flex-1 relative">
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
                  {isPublicVersion 
                    ? "Backend is unavailable. Please try again later."
                    : "Unable to connect to the backend server."
                  }
                </div>
                {!isPublicVersion && backendError && (
                  <div className="text-sm bg-gray-200 dark:bg-gray-700 p-3 rounded-lg border border-gray-300 dark:border-gray-600">
                    <strong>Technical Details:</strong> <span className="font-mono text-xs break-words">{backendError}</span>
                  </div>
                )}
                <div className="flex flex-col space-y-3">
                  {isPublicVersion ? (
                    <>
                      <a
                        href="https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        <i className="zmdi zmdi-download mr-2"></i>
                        Local Deployment
                      </a>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Deploy the tool locally for full control and reliability.
                      </div>
                    </>
                  ) : (
                    <>
                      <a
                        href="https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment#troubleshooting"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        <i className="zmdi zmdi-help-outline mr-2"></i>
                        Troubleshooting Guide
                      </a>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Make sure the server is running and accessible.
                      </div>
                    </>
                  )}
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
        ) : isPreviewPage(currentPage) && showPreviewsPage ? (
          /* Mixed Preview Gallery Page (PNG + STL) */
          <div className="w-full h-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative" style={{ overflow: 'hidden', scrollbarGutter: 'stable' }}>
            <MixedPreviewGallery
              previews={previews}
              taskId={taskId}
              currentPage={currentPage - PAGES.PREVIEWS_START}
              onError={(error) => {
                logger.error('Preview gallery error:', error);
              }}
            />
            {previewsError && (
              <div className="absolute top-4 left-4 right-4 z-20">
                <ErrorDisplay message={previewsError} />
              </div>
            )}
            
          </div>
        ) : validateCoordinates(coordinatesInput) ? (
          /* Map Widget Page */
          <div className="relative w-full h-full" style={{ scrollbarGutter: 'stable' }}>
            <MapWidget 
              coordinates={coordinatesInput}
              onCoordinatesChange={setCoordinatesInput}
              size={selectedSize === "custom" ? customSize : selectedSize}
              rotation={rotation}
              onRotationChange={setRotation}
              onSizeChange={setCustomSize}
              showResizeHandle={selectedSize === "custom"}
              osmData={dataSource === DATA_SOURCES.CUSTOM ? osmData : null}
            />
            
          </div>
        ) : (
          /* Empty State */
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

        {/* Global Slide Navigation - positioned relative to Page Content Area */}
        {totalPages > 1 && (
          <SlideNavigator
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="z-[9999]"
          />
        )}
        </div>
      </div>
    </div>
  );
}
