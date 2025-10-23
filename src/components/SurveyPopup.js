'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SimpleButton from './SimpleButton';

const SURVEY_DISMISSED_KEY = 'maps4fs_survey_dismissed';
const SURVEY_COMPLETED_KEY = 'maps4fs_survey_completed';

export default function SurveyPopup({ isPublic = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show popup regardless of public/private version
    // Check if user has dismissed or completed survey
    const dismissed = localStorage.getItem(SURVEY_DISMISSED_KEY);
    const completed = localStorage.getItem(SURVEY_COMPLETED_KEY);
    
    if (dismissed === 'true' || completed === 'true') {
      return;
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []); // Removed isPublic dependency

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(SURVEY_DISMISSED_KEY, 'true');
    }, 300);
  };

  const handleTakeSurvey = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      router.push('/survey');
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      {/* Popup */}
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transform transition-all duration-300 ${
          isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="pr-6">
          <div className="flex items-start space-x-3 mb-3">
            <div className="text-2xl">📝</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Share your feedback!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                Do you mind taking a quick survey<br />to improve Maps4FS?
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            <SimpleButton
              onClick={handleTakeSurvey}
              variant="primary"
              className="flex-1 text-xs py-2"
            >
              Take Survey
            </SimpleButton>
            <SimpleButton
              onClick={handleDismiss}
              variant="secondary"
              className="text-xs py-2 px-3"
            >
              Later
            </SimpleButton>
          </div>
        </div>
      </div>
    </div>
  );
}