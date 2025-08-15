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

  // Example validation function
  const validateMapName = (value) => {
    // Map name should be at least 3 characters and contain only letters, numbers, spaces, and hyphens
    return value.length >= 3 && /^[a-zA-Z0-9\s\-_]+$/.test(value);
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
        />

        {/* Map Name Input */}
        <TextInput
          label="Map Name"
          value={textInput}
          onChange={setTextInput}
          placeholder="Enter map name..."
          validator={validateMapName}
          errorMessage="Map name must be at least 3 characters and contain only letters, numbers, spaces, and hyphens"
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
