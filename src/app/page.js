'use client';

import { useState } from 'react';
import Selector from '../components/Selector';
import TextInput from '../components/TextInput';
import NumberInput from '../components/NumberInput';
import Slider from '../components/Slider';
import Switch from '../components/Switch';
import Expander from '../components/Expander';
import ErrorDisplay from '../components/ErrorDisplay';
import MapWidget from '../components/MapWidget';
import { validateCoordinates } from '../api/dtm';
import { useDTMProviders } from '../hooks/useDTMProviders';
import config from './config';
import logger from '../utils/logger';
import { 
  gameOptions, 
  createSizeOptions, 
  defaultValues, 
  constraints 
} from '../config/formOptions';

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
  
  // DTM provider state managed by custom hook
  const { 
    dtmOptions, 
    selectedDTMProvider, 
    setSelectedDTMProvider, 
    dtmLoading, 
    dtmError 
  } = useDTMProviders(coordinatesInput);

  // Example Expander values
  const [option1, setOption1] = useState(defaultValues.option1);
  const [option2, setOption2] = useState(defaultValues.option2);
  const [exampleSwitch, setExampleSwitch] = useState(defaultValues.exampleSwitch);

  // Create size options based on version
  const sizeOptions = createSizeOptions(isPublicVersion);

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

        {/* Example Expander with Number Inputs */}
        <Expander 
          label="EXAMPLE OPTIONS"
          summary={`OPTION 1: ${option1}, OPTION 2: ${option2}, SWITCH: ${exampleSwitch ? 'ON' : 'OFF'}`}
          tooltip="Example options for demonstration purposes."
          labelWidth='w-40'
          size="sm"
        >
          <NumberInput
            label="Option 1"
            value={option1}
            onChange={setOption1}
            step={1}
            labelWidth='w-40'
            tooltip="Example option 1."
            size="sm"
          />
          
          <NumberInput
            label="Option 2"
            value={option2}
            onChange={setOption2}
            step={1}
            labelWidth='w-40'
            tooltip="Example option 2."
            size="sm"
          />

          <Switch
            label="Example Switch"
            checked={exampleSwitch}
            onChange={setExampleSwitch}
            labelWidth='w-40'
            tooltip="This is an example switch component that demonstrates toggle functionality."
            size="sm"
          />
        </Expander>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 p-8">
        <MapWidget 
          coordinates={coordinatesInput}
          onCoordinatesChange={setCoordinatesInput}
          size={selectedSize === "custom" ? customSize : selectedSize}
          rotation={rotation}
        />
      </div>
    </div>
  );
}
