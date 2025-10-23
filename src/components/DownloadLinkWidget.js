'use client';

import { useState } from 'react';

export default function DownloadLinkWidget({ taskId, baseUrl = 'https://api.maps4fs.xyz' }) {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  if (!taskId) return null;
  
  const downloadUrl = `${baseUrl}/map/download/${taskId}`;
  
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Show error message to user instead of deprecated fallback
      alert('Copy to clipboard failed. Please manually copy the link.');
    }
  };
  
  return (
    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center mb-3">
        <i className="zmdi zmdi-download text-blue-600 dark:text-blue-400 mr-2"></i>
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Direct Download Link Ready
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Download URL Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={downloadUrl}
            readOnly
            className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none"
          />
        </div>
        
        {/* Copy Button */}
        <button
          onClick={handleCopyToClipboard}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
            showCopySuccess
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <i className={`zmdi ${showCopySuccess ? 'zmdi-check' : 'zmdi-copy'}`}></i>
          <span>{showCopySuccess ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      
      <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
        You can use this link to download your map directly without waiting in the UI.
      </div>
    </div>
  );
}