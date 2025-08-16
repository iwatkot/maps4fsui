'use client';

import { useState } from 'react';
import Selector from '../components/Selector';
import TextInput from '../components/TextInput';
import NumberInput from '../components/NumberInput';
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
  const [noobMode, setNoobMode] = useState(true);

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
        
        {/* Noob Mode Toggle */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Helper Mode</h3>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Show helpful tooltips for all controls</p>
            </div>
            <button
              onClick={() => setNoobMode(!noobMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                noobMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  noobMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
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
            />
          </>
        )}
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
