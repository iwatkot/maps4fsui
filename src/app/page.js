'use client';

import { useState } from 'react';
import Selector from '../components/Selector';
import TextInput from '../components/TextInput';
import NumberInput from '../components/NumberInput';
import Slider from '../components/Slider';
import Expander from '../components/Expander';
import TooltipSwitch from '../components/TooltipSwitch';
import config from './config';
import logger from '../utils/logger';

const isPublicVersion = config.isPublicVersion;
const backendUrl = config.backendUrl;
logger.info(`Running in public version: ${isPublicVersion}. Backend URL: ${backendUrl}`);
logger.info(`Public hostname: ${config.publicHostName}`);

export default function Home() {
  const [selectedGame, setSelectedGame] = useState('fs25');
  const [coordinatesInput, setCoordinatesInput] = useState('');
  const [selectedSize, setSelectedSize] = useState(2048);
  const [customSize, setCustomSize] = useState(2048);
  const [outputSize, setOutputSize] = useState(2048);
  const [rotation, setRotation] = useState(0);
  const [noobMode, setNoobMode] = useState(true);
  
  // Example Expander values
  const [quality, setQuality] = useState(85);
  const [compressionLevel, setCompressionLevel] = useState(6);

  const gameOptions = [
    { 
      value: 'fs25', 
      label: 'Farming Simulator 25', 
      description: 'All features are supported.' 
    },
    { 
      value: 'fs22', 
      label: 'Farming Simulator 22', 
      description: 'Support discontinued, some features may not work.' 
    }
  ];

  const availableSizeOptions = [
    { value: 2048, label: '2048 x 2048 meters', description: '' },
    { value: 4096, label: '4096 x 4096 meters', description: '' },
    { value: 8192, label: '8192 x 8192 meters', description: '' },
    { value: 16384, label: '16384 x 16384 meters', description: '' },
    { value: "custom", label: "Custom Size", description: '' }
  ];
  
  const sizeOptions = isPublicVersion ? [
    ...availableSizeOptions.slice(0, 2), // First two options enabled
    ...availableSizeOptions.slice(2).map(option => ({ // Rest disabled with info
      ...option,
      disabled: true,
      description: option.description || 'Available in local version only'
    }))
  ] : availableSizeOptions;

  // Coordinate validation function
  const validateCoordinates = (value) => {
    // Remove extra whitespace and split by comma or whitespace
    const trimmed = value.trim();
    if (!trimmed) return false;
    
    // Split by comma or whitespace (or both)
    const parts = trimmed.split(/[,\s]+/).filter(part => part.length > 0);
    
    // Must have exactly 2 parts
    if (parts.length !== 2) return false;
    
    // Both parts must be valid floats
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    // Check if parsing was successful (not NaN) and values are reasonable coordinates
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 &&    // Valid latitude range
           lng >= -180 && lng <= 180;    // Valid longitude range
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left Panel */}
      <div className="w-1/2 p-8 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Maps4FS Controls
        </h2>
        
        {/* Helper Mode Toggle */}
        <TooltipSwitch
          label="Helper Mode"
          description="Show helpful tooltips for all controls"
          value={noobMode}
          onChange={setNoobMode}
          size="sm"
        />
        
        {/* Game Selector */}
        <Selector
          label="Game Version"
          options={gameOptions}
          value={selectedGame}
          onChange={setSelectedGame}
          placeholder="Choose your game version..."
          labelWidth='w-40'
          tooltip="Game for which map should be generated."
          showTooltip={noobMode}
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
          showTooltip={noobMode}
          size="sm"
        />

        {/* Map Size Selector */}
        <Selector
          label="Map Size"
          options={sizeOptions}
          value={selectedSize}
          onChange={setSelectedSize}
          placeholder="Choose your map size..."
          labelWidth='w-40'
          showTooltip={noobMode}
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
              showTooltip={noobMode}
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
              showTooltip={noobMode}
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
          showTooltip={noobMode}
          size="sm"
        />

        {/* Example Expander with Number Inputs */}
        <Expander 
          label="Export Options"
          summary={`Quality: ${quality}%, Compression: ${compressionLevel}`}
          tooltip="Configure export quality and compression settings"
          showTooltip={noobMode}
          labelWidth='w-40'
          size="sm"
        >
          <NumberInput
            label="Quality"
            value={quality}
            onChange={setQuality}
            min={1}
            max={100}
            step={1}
            labelWidth='w-40'
            tooltip="Export quality percentage. Higher values mean better quality but larger file size."
            showTooltip={noobMode}
            size="sm"
          />
          
          <NumberInput
            label="Compression"
            value={compressionLevel}
            onChange={setCompressionLevel}
            min={0}
            max={9}
            step={1}
            labelWidth='w-40'
            tooltip="Compression level from 0 (no compression) to 9 (maximum compression)."
            showTooltip={noobMode}
            size="sm"
          />
        </Expander>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Selected game:</strong> {selectedGame}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Text:</strong> {coordinatesInput || 'Empty'}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Map Size:</strong> {selectedSize}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Rotation:</strong> {rotation}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Quality:</strong> {quality}%
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Compression:</strong> {compressionLevel}
          </p>
          {selectedSize === "custom" && (
            <>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Custom Size:</strong> {customSize} meters
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Output Size:</strong> {outputSize} pixels
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
