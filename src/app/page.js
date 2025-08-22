'use client';

import { useState } from 'react';
import Selector from '@/components/Selector';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import TooltipSwitch  from '@/components/TooltipSwitch';
import Slider from '@/components/Slider';
import ErrorDisplay from '@/components/ErrorDisplay';
import MapWidget from '@/components/MapWidget';
import { validateCoordinates } from '@/api/preprocess';
import { useDTMProviders } from '@/hooks/useDTMProviders';
import config from '@/app/config';
import logger from '@/utils/logger';
import { 
  gameOptions, 
  createSizeOptions, 
  defaultValues, 
} from '@/config/validation';
import ButtonProgress from '@/components/ButtonProgress';
import { useMapGeneration } from '@/hooks/useMapGeneration';
import demSettingsContent from '@/app/settings/demSettings';
import backgroundSettingsContent from '@/app/settings/backgroundSettings';
import grleSettingsContent from '@/app/settings/grleSettings';
import i3dSettingsContent from '@/app/settings/i3dSettings';

const isPublicVersion = config.isPublicVersion;
const backendUrl = config.backendUrl;
logger.info(`Running in public version: ${isPublicVersion}. Backend URL: ${backendUrl}`);
logger.info(`Public hostname: ${config.publicHostName}`);

export default function Home() {
  const [selectedGame, setSelectedGame] = useState(defaultValues.game);
  const [coordinatesInput, setCoordinatesInput] = useState(defaultValues.coordinates);
  const [selectedSize, setSelectedSize] = useState(defaultValues.size);
  const [customSize, setCustomSize] = useState(defaultValues.customSize);
  const [outputSize, setOutputSize] = useState(defaultValues.outputSize);
  const [rotation, setRotation] = useState(defaultValues.rotation);

  const [onlyPopularSettings, setOnlyPopularSettings] = useState(true);

  // DTM provider state managed by custom hook
  const { 
    dtmOptions, 
    selectedDTMProvider, 
    setSelectedDTMProvider, 
    dtmLoading, 
    dtmError 
  } = useDTMProviders(coordinatesInput);

  // Create size options based on version
  const sizeOptions = createSizeOptions(isPublicVersion);
  
  // Get settings content and values.
  const { content: demContent, values: demValues } = demSettingsContent(!onlyPopularSettings);
  const { content: backgroundContent, values: backgroundValues } = backgroundSettingsContent(!onlyPopularSettings, config.isPublicVersion);
  const { content: grleContent, values: grleValues } = grleSettingsContent(!onlyPopularSettings);
  const { content: i3dContent, values: i3dValues } = i3dSettingsContent(!onlyPopularSettings);

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
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
        {validateCoordinates(coordinatesInput) ? (
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
  );
}
