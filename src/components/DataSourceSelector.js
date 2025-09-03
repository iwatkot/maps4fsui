'use client';

import { useState } from 'react';
import InfoIcon from './InfoIcon';
import OsmFileUpload from './OsmFileUpload';
import { processOsmFile } from '@/utils/osmUtils';

const DATA_SOURCES = {
  PUBLIC: 'public',
  CUSTOM: 'custom'
};

export default function DataSourceSelector({ 
  selectedSource = DATA_SOURCES.PUBLIC,
  onSourceChange,
  selectedFile,
  onFileSelect,
  onFileRemove,
  onOsmDataProcessed,
  disabled = false
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  
  const handleSourceChange = (source) => {
    if (disabled) return;
    
    // If switching away from custom, remove any selected file and processed data
    if (selectedSource === DATA_SOURCES.CUSTOM && source === DATA_SOURCES.PUBLIC) {
      onFileRemove();
      if (onOsmDataProcessed) {
        onOsmDataProcessed(null);
      }
    }
    
    onSourceChange(source);
  };

  const handleFileSelect = async (file) => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      // Process the OSM file
      const processedData = await processOsmFile(file);
      
      // Add timestamp for cache busting
      processedData.timestamp = Date.now();
      
      // Call the parent handlers
      onFileSelect(file);
      if (onOsmDataProcessed) {
        onOsmDataProcessed(processedData);
      }
      
      console.log(`Successfully processed OSM file: ${processedData.featureCount} features`);
    } catch (error) {
      console.error('Failed to process OSM file:', error);
      setProcessingError(error.message);
      // Don't call onFileSelect if processing failed
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileRemove = () => {
    onFileRemove();
    if (onOsmDataProcessed) {
      onOsmDataProcessed(null);
    }
    setProcessingError(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <InfoIcon 
          text="Choose between public OpenStreetMap data or upload your own custom OSM file. Custom files will be used for both map preview and generation."
        />
      </div>

      {/* Source Selection */}
      <div className="flex space-x-4">
        {/* Public OSM Option */}
        <label className={`
          flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all flex-1
          ${selectedSource === DATA_SOURCES.PUBLIC 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}>
          <input
            type="radio"
            name="dataSource"
            value={DATA_SOURCES.PUBLIC}
            checked={selectedSource === DATA_SOURCES.PUBLIC}
            onChange={(e) => handleSourceChange(e.target.value)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-900 dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="flex items-center space-x-2">
            <i className="zmdi zmdi-globe text-blue-600 dark:text-blue-400"></i>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Public OpenStreetMap
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Real-time OSM data
              </div>
            </div>
          </div>
        </label>

        {/* Custom OSM File Option */}
        <label className={`
          flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all flex-1
          ${selectedSource === DATA_SOURCES.CUSTOM 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}>
          <input
            type="radio"
            name="dataSource"
            value={DATA_SOURCES.CUSTOM}
            checked={selectedSource === DATA_SOURCES.CUSTOM}
            onChange={(e) => handleSourceChange(e.target.value)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-900 dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="flex items-center space-x-2">
            <i className="zmdi zmdi-file text-orange-600 dark:text-orange-400"></i>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Custom OSM File
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Upload your own data
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* File Upload Section - Only show when custom is selected */}
      {selectedSource === DATA_SOURCES.CUSTOM && (
        <div className="mt-4 space-y-3">
          {processingError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-800 dark:text-red-200">
                <i className="zmdi zmdi-alert-triangle mr-2"></i>
                {processingError}
              </div>
            </div>
          )}
          
          {isProcessing && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                <div className="animate-spin mr-2">⏳</div>
                Processing OSM file...
              </div>
            </div>
          )}
          
          <OsmFileUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onFileRemove={handleFileRemove}
            disabled={disabled || isProcessing}
          />
        </div>
      )}
    </div>
  );
}

export { DATA_SOURCES };
