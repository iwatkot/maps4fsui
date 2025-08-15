'use client';

import { useState } from 'react';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('fs25');
  const [textInput, setTextInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOptionChange = (value) => {
    setSelectedOption(value);
    setIsDropdownOpen(false);
    console.log('Selected option:', value);
  };

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
    console.log('Text input:', e.target.value);
  };

  const options = [
    { value: 'fs25', label: 'Farming Simulator 25', description: 'All features are supported.' },
    { value: 'fs22', label: 'Farming Simulator 22', description: 'Support discontinued, some features may not work.' }
  ];

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
          
          {/* Custom Dropdown */}
          <div className="relative">
            {/* Dropdown Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg hover:shadow-xl focus:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-900 dark:text-white font-medium">
                  {options.find(opt => opt.value === selectedOption)?.label}
                </span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Panel */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionChange(option.value)}
                    className={`w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-150 flex items-center space-x-3 group ${
                      selectedOption === option.value 
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                      selectedOption === option.value 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400'
                    }`}></div>
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                    {selectedOption === option.value && (
                      <svg className="w-4 h-4 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
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
