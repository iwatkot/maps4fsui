'use client';

import { useState, useEffect } from 'react';

/**
 * DonationPopup component - Shows a donation request popup every 3rd visit
 * Tracks visits using localStorage
 */
export default function DonationPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if this is a browser environment
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = 'maps4fs_visit_count';
    const POPUP_INTERVAL = 3; // Show every 3rd visit

    try {
      // Get current visit count
      let visitCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      visitCount += 1;

      // Store updated count
      localStorage.setItem(STORAGE_KEY, visitCount.toString());

      // Show popup every 3rd visit
      if (visitCount % POPUP_INTERVAL === 0) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 px-6 py-6">
          <h2 className="text-2xl font-bold text-white mb-2">☕ Maps4FS Needs Your Help</h2>
          <p className="text-amber-50">Keep this project running</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Maps4FS is a free, personal, open-source project created and maintained without any profit motive.
          </p>

          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            To keep this project running, I need to cover essential costs such as:
          </p>

          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <span className="mr-2">🌐</span>
              <span>Hosting services for the website and generation features</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔗</span>
              <span>Domain registrations to keep platforms accessible</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">⚙️</span>
              <span>Infrastructure costs for reliable downloads and map generation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🚀</span>
              <span>Development resources to continue improving features</span>
            </li>
          </ul>

          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium pt-2">
            If you find Maps4FS valuable, please consider supporting it. Every contribution helps! 🙏
          </p>
        </div>

        {/* Donation Links */}
        <div className="px-6 py-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Choose a platform:</p>
          <div className="grid grid-cols-1 gap-2">
            <a
              href="https://buymeacoffee.com/iwatkot"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              ☕ Buy Me a Coffee
            </a>
            <a
              href="https://www.patreon.com/iwatkot"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              🎨 Patreon
            </a>
            <a
              href="https://ko-fi.com/iwatkot"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              💙 Ko-fi
            </a>
          </div>

          {/* Crypto Option */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Crypto (USDT on TRC20):</p>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all">
                TGm46LNqe4RcVdsz5sWJw5eLZBp4W8ZSLk
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
