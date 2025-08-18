'use client';

import { useState, useEffect } from 'react';
import Selector from '../components/Selector';
import TextInput from '../components/TextInput';
import NumberInput from '../components/NumberInput';
import Slider from '../components/Slider';
import Expander from '../components/Expander';
import { useApiCall } from '../hooks/useApi';
import { getDTMProviders } from '../api/dtm';
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
  const [selectedDTMProvider, setSelectedDTMProvider] = useState('srtm30');
  const [dtmOptions, setDtmOptions] = useState([
    { value: 'srtm30', label: '🌎 Global [30.0 m/px] SRTM 30 m', description: '' }
  ]);

  // API hook for fetching DTM providers
  const { loading: dtmLoading, error: dtmError, execute: fetchDTMProviders } = useApiCall(getDTMProviders);
  
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

  // Parse coordinates for DTM API
  const parseCoordinates = (value) => {
    if (!validateCoordinates(value)) return null;
    
    const trimmed = value.trim();
    const parts = trimmed.split(/[,\s]+/).filter(part => part.length > 0);
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    
    return { lat, lon };
  };

  // Effect to fetch DTM providers when coordinates change
  useEffect(() => {
    const coords = parseCoordinates(coordinatesInput);
    const defaultOption = { value: 'srtm30', label: '🌎 Global [30.0 m/px] SRTM 30 m', description: '' };
    
    if (coords) {
      logger.info('Coordinates changed, fetching DTM providers for:', coords);
      
      fetchDTMProviders(coords.lat, coords.lon)
        .then((providers) => {
          // Convert providers object to options array
          const apiOptions = Object.entries(providers).map(([key, label]) => ({
            value: key,
            label: label,
            description: ''
          }));
          
          // Merge default option with API options, removing duplicates
          const mergedOptions = [defaultOption];
          apiOptions.forEach(option => {
            if (option.value !== 'srtm30') {
              mergedOptions.push(option);
            }
          });
          
          setDtmOptions(mergedOptions);
          
          // Keep srtm30 selected if it was already selected
          if (!selectedDTMProvider || selectedDTMProvider === 'srtm30') {
            setSelectedDTMProvider('srtm30');
          }
          
          logger.info(`Set ${mergedOptions.length} DTM provider options`);
        })
        .catch((error) => {
          logger.error('Failed to fetch DTM providers:', error.message);
          // Keep default option even on error
          setDtmOptions([defaultOption]);
          setSelectedDTMProvider('srtm30');
        });
    } else {
      // Keep default option even without coordinates
      setDtmOptions([defaultOption]);
      setSelectedDTMProvider('srtm30');
    }
  }, [coordinatesInput, fetchDTMProviders]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left Panel */}
      <div className="w-1/2 p-8 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Maps4FS Controls
        </h2>
        
        {/* Game Selector */}
        <Selector
          label="Game Version"
          options={gameOptions}
          value={selectedGame}
          onChange={setSelectedGame}
          placeholder="Choose your game version..."
          labelWidth='w-40'
          tooltip="Game for which map should be generated."
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
        {dtmError && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load DTM providers: {dtmError.message}
            </p>
          </div>
        )}

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
          label="Export Options"
          summary={`Quality: ${quality}%, Compression: ${compressionLevel}`}
          tooltip="Configure export quality and compression settings"
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
          {selectedDTMProvider && (
            <p className="text-gray-700 dark:text-gray-300">
              <strong>DTM Provider:</strong> {dtmOptions.find(opt => opt.value === selectedDTMProvider)?.label || selectedDTMProvider}
            </p>
          )}
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
