'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import StickyFooter from '@/components/StickyFooter';
import config from '@/app/config';

export default function DownloadPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/download');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden" style={{ minWidth: '1000px' }}>
      <AppHeader 
        showTabs={false}
        customTitle="Download Windows App"
        onBackClick={() => window.location.href = '/'}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Download Maps4FS for Windows
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Download the standalone Windows application to run Maps4FS locally on your machine with full access to all features.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <i className="zmdi zmdi-alert-circle text-red-600 dark:text-red-400 text-xl mr-3"></i>
                <div>
                  <h3 className="text-red-800 dark:text-red-300 font-semibold">Error loading files</h3>
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Files List */}
          {!loading && !error && files.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <i className="zmdi zmdi-info text-yellow-600 dark:text-yellow-400 text-3xl mb-2"></i>
              <p className="text-yellow-800 dark:text-yellow-300">No files available for download at the moment.</p>
            </div>
          )}

          {!loading && !error && files.length > 0 && (
            <div className="space-y-4">
              {files.map((file, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <i className="zmdi zmdi-windows text-blue-500 text-2xl mr-3"></i>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {file.name}
                        </h3>
                      </div>
                      <div className="ml-9 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Size:</span> {formatFileSize(file.size)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Updated:</span> {formatDate(file.lastModified)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download
                      className="ml-4 inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <i className="zmdi zmdi-download mr-2"></i>
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Section */}
          {!loading && !error && files.length > 0 && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-blue-900 dark:text-blue-300 font-semibold mb-3 flex items-center">
                <i className="zmdi zmdi-info text-xl mr-2"></i>
                Installation Instructions
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300 text-sm">
                <li>Download the latest .exe file from the list above</li>
                <li>Run the installer and follow the setup wizard</li>
                <li>Launch Maps4FS from your Start Menu or Desktop shortcut</li>
                <li>Start generating maps offline with full features!</li>
              </ol>
            </div>
          )}

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Need help? Check out our documentation or join our community.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://maps4fs.gitbook.io/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
              >
                <i className="zmdi zmdi-book mr-2"></i>
                Documentation
              </a>
              <a
                href="https://discord.gg/Sj5QKKyE42"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <i className="zmdi zmdi-comments mr-2"></i>
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </div>

      <StickyFooter />
    </div>
  );
}
