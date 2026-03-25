'use client';

import { useState, useEffect } from 'react';

/**
 * DonationPopup component - Shows a donation request popup every 3rd visit
 * Tracks visits using localStorage
 */
export default function DonationPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const VISIT_COUNT_KEY = 'maps4fs_visit_count';
  const HIDDEN_KEY = 'maps4fs-donation-popup-hidden';
  const ACTIVE_KEY = 'maps4fs-donation-popup-active';

  const publishPopupState = (isActive) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(ACTIVE_KEY, isActive ? 'true' : 'false');
      window.dispatchEvent(
        new CustomEvent('maps4fs:donation-popup-state', {
          detail: { isActive },
        })
      );
    } catch (error) {
      console.error('Error updating donation popup state:', error);
    }
  };

  useEffect(() => {
    // Check if this is a browser environment
    if (typeof window === 'undefined') return;

    const POPUP_INTERVAL = 3; // Show every 3rd visit

    try {
      const isHiddenForever = localStorage.getItem(HIDDEN_KEY) === 'true';
      if (isHiddenForever) {
        setIsOpen(false);
        publishPopupState(false);
        return;
      }

      // Get current visit count
      let visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
      visitCount += 1;

      // Store updated count
      localStorage.setItem(VISIT_COUNT_KEY, visitCount.toString());

      // Show popup every 3rd visit
      if (visitCount % POPUP_INTERVAL === 0) {
        setIsOpen(true);
      } else {
        publishPopupState(false);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [HIDDEN_KEY, VISIT_COUNT_KEY]);

  useEffect(() => {
    publishPopupState(isOpen);

    return () => {
      publishPopupState(false);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDontShowAgain = () => {
    try {
      localStorage.setItem(HIDDEN_KEY, 'true');
    } catch (error) {
      console.error('Error saving donation popup preference:', error);
    }

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
          <h2 className="text-2xl font-bold text-white mb-2">☕ Support Maps4FS</h2>
          <p className="text-amber-50">Help this project grow</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Maps4FS is a free, personal, open-source project created and maintained without any profit motive.
          </p>

          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            If Maps4FS is useful for you, you can support the project and help me keep improving it for everyone.
          </p>

          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium pt-2">
            You can support the project completely for free: subscribe on social media, drop a like, and share Maps4FS.
          </p>

          <div className="flex items-center justify-center gap-3 pt-1">
            <a
              href="https://www.youtube.com/@iwatkot"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2a31 31 0 0 0 0 11.6 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31 31 0 0 0 0-11.6ZM9.6 15.5V8.5l6.2 3.5-6.2 3.5Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/iwatkot"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@iwatkot"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-10 h-10 rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.4 3.2c.7 2 2.1 3.3 4.1 3.9v3.3a8.7 8.7 0 0 1-3.4-.8v6.1A5.8 5.8 0 1 1 11.3 10c.4 0 .8 0 1.1.1v3.2a2.5 2.5 0 1 0 1.4 2.3V3.2h2.6Z" />
              </svg>
            </a>
          </div>
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
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDontShowAgain}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Don&apos;t show again
          </button>
        </div>
      </div>
    </div>
  );
}
