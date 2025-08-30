'use client';

import { useState, useEffect } from 'react';

export default function SlideOutPromo({ 
  title, 
  message, 
  buttonText, 
  buttonLink, 
  isVisible: externalVisible = true,
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (externalVisible) {
      // First, mount the component (invisible)
      setIsVisible(true);
      
      // Then after a delay, start the slide-in animation
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 2000); // 2 second delay before sliding in
      
      return () => clearTimeout(timer);
    }
  }, [externalVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Wait for slide-out animation to complete
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-transform duration-500 ease-out ${
        isAnimating ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-r-lg p-3 max-w-xs w-80">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          title="Close"
        >
          <i className="zmdi zmdi-close text-lg"></i>
        </button>

        {/* Content */}
        <div className="pr-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
            {message}
          </p>
          
          {buttonLink && buttonText && (
            <a
              href={buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
            >
              {buttonText}
              <i className="zmdi zmdi-open-in-new ml-1 text-xs"></i>
            </a>
          )}
        </div>

        {/* Small arrow pointing to the edge */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>
      </div>
    </div>
  );
}
