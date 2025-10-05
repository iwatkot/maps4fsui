'use client';

import Link from 'next/link';

export default function ErrorDisplay({ 
  error, 
  title = "Error",
  className = "",
  showHelpLink = true
}) {
  if (!error) return null;

  return (
    <div className={`mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
      <div className="p-3">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className="zmdi zmdi-alert-triangle text-red-500 dark:text-red-400 text-lg"></i>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-600 dark:text-red-400">
              {title && <strong>{title}:</strong>} {error.message || error}
            </p>
          </div>
        </div>
      </div>
      {showHelpLink && (
        <div className="border-t border-red-200 dark:border-red-700 bg-red-100 dark:bg-red-900/40 px-3 py-2">
          <Link
            href="/help"
            className="inline-flex items-center text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-colors"
            title="Get help with this issue"
          >
            <i className="zmdi zmdi-help-outline mr-2 text-base"></i>
            Need help? Click here to get assistance
            <i className="zmdi zmdi-arrow-right ml-2 text-xs"></i>
          </Link>
        </div>
      )}
    </div>
  );
}
