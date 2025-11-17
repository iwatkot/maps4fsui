'use client';

import { useState, useEffect } from 'react';
import SimpleButton from './SimpleButton';

export default function SecurityWarning({ onProceed }) {
  const [checkboxes, setCheckboxes] = useState({
    unofficial: false,
    malware: false,
    noSupport: false
  });
  const [enabledCheckboxes, setEnabledCheckboxes] = useState({
    unofficial: true,
    malware: false,
    noSupport: false
  });
  const [proceedTimer, setProceedTimer] = useState(10);
  const [canProceed, setCanProceed] = useState(false);

  // Enable checkboxes progressively
  useEffect(() => {
    if (checkboxes.unofficial && !enabledCheckboxes.malware) {
      const timer = setTimeout(() => {
        setEnabledCheckboxes(prev => ({ ...prev, malware: true }));
      }, 2000); // 2 second delay
      return () => clearTimeout(timer);
    }
  }, [checkboxes.unofficial, enabledCheckboxes.malware]);

  useEffect(() => {
    if (checkboxes.malware && !enabledCheckboxes.noSupport) {
      const timer = setTimeout(() => {
        setEnabledCheckboxes(prev => ({ ...prev, noSupport: true }));
      }, 2000); // 2 second delay
      return () => clearTimeout(timer);
    }
  }, [checkboxes.malware, enabledCheckboxes.noSupport]);

  // Start countdown timer when all checkboxes are checked
  useEffect(() => {
    if (checkboxes.unofficial && checkboxes.malware && checkboxes.noSupport) {
      if (proceedTimer > 0) {
        const timer = setInterval(() => {
          setProceedTimer(prev => {
            if (prev <= 1) {
              setCanProceed(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [checkboxes, proceedTimer]);

  const handleCheckboxChange = (name) => {
    setCheckboxes(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleProceed = () => {
    if (canProceed) {
      onProceed();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-8 border-4 border-red-600">
        {/* Warning Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mr-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Security Warning</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unofficial Version Detected</p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 mb-6">
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-2">
            You are accessing maps4fs from an unofficial domain.
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            This version is not verified by the maps4fs developer and may pose security risks.
            Official domains: <strong>maps4fs.xyz</strong>, <strong>www.maps4fs.xyz</strong>
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4 mb-6">
          {/* Checkbox 1 */}
          <label className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
            enabledCheckboxes.unofficial 
              ? 'border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
          } ${checkboxes.unofficial ? 'bg-red-50 dark:bg-red-900/10 border-red-500' : 'bg-white dark:bg-gray-800'}`}>
            <input
              type="checkbox"
              checked={checkboxes.unofficial}
              onChange={() => handleCheckboxChange('unofficial')}
              disabled={!enabledCheckboxes.unofficial}
              className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500 focus:ring-2 disabled:opacity-50 flex-shrink-0"
            />
            <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">
              <strong>I confirm</strong> that I understand I&apos;m using an <strong>unofficial version</strong> of maps4fs
            </span>
          </label>

          {/* Checkbox 2 */}
          <label className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
            enabledCheckboxes.malware 
              ? 'border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
          } ${checkboxes.malware ? 'bg-red-50 dark:bg-red-900/10 border-red-500' : 'bg-white dark:bg-gray-800'}`}>
            <input
              type="checkbox"
              checked={checkboxes.malware}
              onChange={() => handleCheckboxChange('malware')}
              disabled={!enabledCheckboxes.malware}
              className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500 focus:ring-2 disabled:opacity-50 flex-shrink-0"
            />
            <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">
              <strong>I confirm</strong> that I understand this version may contain <strong>malware, viruses, or malicious code</strong> and may compromise my security
            </span>
          </label>

          {/* Checkbox 3 */}
          <label className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
            enabledCheckboxes.noSupport 
              ? 'border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
          } ${checkboxes.noSupport ? 'bg-red-50 dark:bg-red-900/10 border-red-500' : 'bg-white dark:bg-gray-800'}`}>
            <input
              type="checkbox"
              checked={checkboxes.noSupport}
              onChange={() => handleCheckboxChange('noSupport')}
              disabled={!enabledCheckboxes.noSupport}
              className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500 focus:ring-2 disabled:opacity-50 flex-shrink-0"
            />
            <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">
              <strong>I confirm</strong> that I&apos;m <strong>not eligible for any support or help</strong> from the maps4fs developer
            </span>
          </label>
        </div>

        {/* Proceed Button */}
        <div className="flex flex-col items-center">
          <SimpleButton
            onClick={handleProceed}
            disabled={!canProceed}
            variant={canProceed ? "danger" : "secondary"}
            className="w-full text-lg py-3"
          >
            {!checkboxes.unofficial || !checkboxes.malware || !checkboxes.noSupport
              ? 'Complete all confirmations to proceed'
              : canProceed
              ? 'Proceed at Your Own Risk'
              : `Wait ${proceedTimer} seconds to proceed`
            }
          </SimpleButton>
        </div>

        {/* Footer Warning */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            It&apos;s strongly recommended to use the official version at{' '}
            <a href="https://maps4fs.xyz" className="text-red-600 dark:text-red-400 font-medium hover:underline">
              maps4fs.xyz
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
