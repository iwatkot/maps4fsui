'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const WelcomeTooltip = () => {
  // DISABLED - keeping the component but never showing it
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already seen this message
    const hasSeenMessage = localStorage.getItem('atlasfs-announcement-seen');
    
    // DISABLED: Never show this popup
    // if (!hasSeenMessage) {
    //   setIsVisible(true);
    // }
  }, []);

  const handleClose = () => {
    // Save to localStorage that user has seen the message
    localStorage.setItem('atlasfs-announcement-seen', 'true');
    setIsVisible(false);
  };

  // Always return null - popup is disabled
  return null;
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div className="relative max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-5 text-gray-900 dark:text-gray-100 pr-6">
            Sorry for the interruption!
          </h2>
          
          <div className="space-y-4 text-base leading-relaxed text-gray-800 dark:text-gray-300">
            <p>I have some exciting news to share with you.</p>
            
            <p>
              I just launched <strong className="font-semibold">Farming Simulator Atlas</strong> at{' '}
              <a 
                href="https://atlasfs.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium"
              >
                atlasfs.xyz
              </a>
              {' '}, a platform where you can download ready-to-play maps based on real-world locations, 
              similar to what you create here with maps4fs.
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 italic border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1">
              All credits go to the map authors. You&apos;ll have full control to add donation links and attribution.
            </p>
            
            <p className="font-medium text-gray-900 dark:text-gray-100">
              If you&apos;d like to publish your map on Atlas, I&apos;d love to help! 
              I&apos;ll handle everything, just reach out to me on{' '}
              <a 
                href="https://discord.gg/wemVfUUFRA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium"
              >
                Discord
              </a>.
            </p>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              <p>Sincerely,</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">iwatkot</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">The developer of maps4fs</p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="mt-7 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTooltip;
