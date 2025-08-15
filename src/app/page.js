'use client';

import { useState } from 'react';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('optionA');
  const [textInput, setTextInput] = useState('');

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    console.log('Selected option:', e.target.value);
  };

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
    console.log('Text input:', e.target.value);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left Panel */}
      <div className="w-1/2 p-8 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Maps4FS Controls
        </h2>
        
        {/* Selector Widget */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Option
          </label>
          <select
            value={selectedOption}
            onChange={handleOptionChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="optionA">Option A</option>
            <option value="optionB">Option B</option>
          </select>
        </div>

        {/* Text Input Widget */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text Input
          </label>
          <input
            type="text"
            value={textInput}
            onChange={handleTextChange}
            placeholder="Enter your text here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

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
