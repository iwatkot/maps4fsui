'use client';

import { useState, useEffect } from 'react';

export default function JSONEditorModal({ isOpen, onClose, jsonData, title }) {
  const [editedJson, setEditedJson] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    if (jsonData && isOpen) {
      setEditedJson(JSON.stringify(jsonData, null, 2));
      setIsValid(true);
      setError('');
    }
  }, [jsonData, isOpen]);

  const validateJSON = (jsonString) => {
    try {
      JSON.parse(jsonString);
      setIsValid(true);
      setError('');
      return true;
    } catch (err) {
      setIsValid(false);
      setError(err.message);
      return false;
    }
  };

  const handleJsonChange = (e) => {
    const value = e.target.value;
    setEditedJson(value);
    validateJSON(value);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedJson);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = editedJson;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSaveToFile = () => {
    if (!isValid) {
      return; // Just return silently, the button is already disabled
    }

    try {
      const blob = new Blob([editedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Copy Success Toast */}
          {showCopySuccess && (
            <div className="absolute top-4 right-16 z-10 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-pulse">
              <i className="zmdi zmdi-check mr-2"></i>
              Copied to clipboard!
            </div>
          )}
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title} - JSON Editor
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className="zmdi zmdi-close text-2xl"></i>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Error message */}
            {!isValid && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex">
                  <i className="zmdi zmdi-alert-triangle text-red-400 mr-2 mt-0.5"></i>
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                      Invalid JSON
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* JSON Editor */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                JSON Content
              </label>
              <textarea
                value={editedJson}
                onChange={handleJsonChange}
                className={`w-full h-96 p-3 border rounded-md font-mono text-sm ${
                  isValid 
                    ? 'border-gray-300 dark:border-gray-600' 
                    : 'border-red-300 dark:border-red-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="JSON content..."
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                {isValid ? (
                  <>
                    <i className="zmdi zmdi-check text-green-500 mr-1"></i>
                    Valid JSON
                  </>
                ) : (
                  <>
                    <i className="zmdi zmdi-close text-red-500 mr-1"></i>
                    Invalid JSON
                  </>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                >
                  <i className="zmdi zmdi-copy mr-2"></i>
                  Copy
                </button>
                
                <button
                  onClick={handleSaveToFile}
                  disabled={!isValid}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                >
                  <i className="zmdi zmdi-download mr-2"></i>
                  Save
                </button>
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
