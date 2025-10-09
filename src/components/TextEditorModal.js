'use client';

import { useState, useEffect } from 'react';

export default function TextEditorModal({ isOpen, onClose, onSave, textData, title, placeholder = "Paste your text here..." }) {
  const [editedText, setEditedText] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedText(textData || '');
    }
  }, [textData, isOpen]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setEditedText(value);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = editedText;
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
    try {
      const blob = new Blob([editedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  const handleClose = () => {
    // Auto-save if onSave is provided
    if (onSave) {
      onSave(editedText);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <i className="zmdi zmdi-close text-xl"></i>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <textarea
              value={editedText}
              onChange={handleTextChange}
              placeholder={placeholder}
              className="flex-1 w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[400px]"
              style={{ fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center space-x-3">
              {/* Copy button */}
              <button
                onClick={handleCopyToClipboard}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  showCopySuccess
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <i className={`zmdi ${showCopySuccess ? 'zmdi-check' : 'zmdi-copy'}`}></i>
                <span>{showCopySuccess ? 'Copied!' : 'Copy'}</span>
              </button>

              {/* Save to file button */}
              <button
                onClick={handleSaveToFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <i className="zmdi zmdi-download"></i>
                <span>Save File</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}