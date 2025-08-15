'use client';

import { useState } from 'react';
import Selector from '../components/Selector';
import TextInput from '../components/TextInput';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('fs25');
  const [textInput, setTextInput] = useState('');

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
        
        {/* Game Selector */}
        <Selector
          label="Game Version"
          options={gameOptions}
          value={selectedOption}
          onChange={setSelectedOption}
          placeholder="Choose your game version..."
          tooltip="Select which version of Farming Simulator you're using. FS25 has full feature support."
        />

        {/* Coordinates Input */}
        <TextInput
          label="Coordinates"
          value={textInput}
          onChange={setTextInput}
          placeholder="45.269442974603706, 19.794450719382542"
          validator={validateCoordinates}
          errorMessage="Enter valid coordinates (latitude, longitude) separated by comma or space. Example: 45.269, 19.794"
          tooltip="Enter the center coordinates of your map area. You can copy these from Google Maps by right-clicking on a location."
        />

        {/* Current Values Display */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Current Values
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Selected:</strong> {selectedOption}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Text:</strong> {textInput || 'Empty'}
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Maps4FS Interface
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            This is where your map content will go.
          </p>
          <p className="text-gray-500 dark:text-gray-500 mt-4">
            Theme automatically follows your system preference.
          </p>
        </div>
      </div>
    </div>
  );
}
