'use client';

import Link from 'next/link';

export default function BackendUnavailableDisplay({ 
  isPublicVersion = false,
  backendError = null
}) {
  if (isPublicVersion) {
    // Public version - show donation appeal
    return (
      <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://github.com/iwatkot/maps4fs/releases/download/2.1.2/502.jpg"
            alt="Maps4FS Preview"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-5 max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Icon */}
            <div className="text-4xl">💔</div>
            
            {/* Main Message */}
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                Backend Service Offline
              </div>
              <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                The maps4fs backend hosting was disconnected because it requires monthly payment to provide map generation for everyone. This month lacked sufficient donations to cover hosting costs.
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                Help us keep maps4fs running!
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Every donation counts, even small amounts help us cover hosting costs and keep the service available for everyone.
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://buymeacoffee.com/iwatkot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  <i className="zmdi zmdi-favorite mr-2"></i>
                  Buy Me a Coffee
                </a>
                <a
                  href="https://www.patreon.com/iwatkot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  <i className="zmdi zmdi-favorite-outline mr-2"></i>
                  Support on Patreon
                </a>
              </div>
            </div>

            {/* Download Windows App Link */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <a
                href="https://maps4fs.xyz/download"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <i className="zmdi zmdi-download mr-2"></i>
                Download Windows App (Offline)
              </a>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You can run maps4fs on your Windows machine with full offline functionality
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Local version - show technical error
  return (
    <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://github.com/iwatkot/maps4fs/releases/download/2.1.2/502.jpg"
          alt="Maps4FS Preview"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">Backend Service Unavailable</div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Unable to connect to the backend server.
          </div>
          {backendError && (
            <div className="text-sm bg-gray-200 dark:bg-gray-700 p-3 rounded-lg border border-gray-300 dark:border-gray-600">
              <strong>Technical Details:</strong> <span className="font-mono text-xs break-words">{backendError}</span>
            </div>
          )}
          <div className="flex flex-col space-y-3">
            <a
              href="https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment#troubleshooting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <i className="zmdi zmdi-help-outline mr-2"></i>
              Troubleshooting Guide
            </a>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Make sure the server is running and accessible.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
