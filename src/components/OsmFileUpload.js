'use client';

import { useState, useRef } from 'react';
import InfoIcon from './InfoIcon';

export default function OsmFileUpload({ 
  onFileSelect, 
  selectedFile, 
  onFileRemove,
  disabled = false 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateOsmFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files[0];
    if (file && validateOsmFile(file)) {
      onFileSelect(file);
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const validateOsmFile = (file) => {
    const validExtensions = ['.osm', '.xml'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      alert('Please select a valid OSM file (.osm or .xml)');
      return false;
    }
    
    // Check file size (limit to 50MB for now)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('File size too large. Please select a file smaller than 50MB.');
      return false;
    }
    
    return true;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDivClick = () => {
    handleBrowseClick();
  };

  const handleRemoveFile = () => {
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* File Upload Area */}
      {!selectedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
            ${disabled 
              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed' 
              : isDragOver 
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleDivClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".osm,.xml"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          <div className={`space-y-2 ${disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <div className="text-2xl">📁</div>
            <div className="text-sm font-medium">
              {disabled ? 'OSM Upload Disabled' : 'Drop OSM file here or click to browse'}
            </div>
            <div className="text-xs">
              {disabled ? 'Connect to backend to enable custom OSM upload' : 'Supports .osm and .xml files (max 50MB)'}
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Display */
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-green-600 dark:text-green-400">
              <i className="zmdi zmdi-file text-lg"></i>
            </div>
            <div>
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                {selectedFile.name}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-green-600 dark:text-green-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
            title="Remove file"
            disabled={disabled}
          >
            <i className="zmdi zmdi-close text-sm"></i>
          </button>
        </div>
      )}
    </div>
  );
}
