'use client';

/**
 * PageNavigator - Navigation component for switching between pages
 * @param {number} currentPage - Current active page (0-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {array} pageLabels - Optional labels for pages (defaults to "Page 1", "Page 2", etc.)
 */
export default function PageNavigator({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageLabels = null 
}) {
  if (totalPages <= 1) return null;

  const getPageLabel = (index) => {
    if (pageLabels && pageLabels[index]) {
      return pageLabels[index];
    }
    return `Page ${index + 1}`;
  };

  return (
    <div className="flex items-center justify-center space-x-1 mb-4">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`
          p-2 rounded-lg text-sm font-medium transition-colors
          ${currentPage === 0 
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }
        `}
        title="Previous page"
      >
        <i className="zmdi zmdi-chevron-left text-lg"></i>
      </button>

      {/* Page buttons */}
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${currentPage === index
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }
          `}
          title={getPageLabel(index)}
        >
          {index + 1}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={`
          p-2 rounded-lg text-sm font-medium transition-colors
          ${currentPage === totalPages - 1
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }
        `}
        title="Next page"
      >
        <i className="zmdi zmdi-chevron-right text-lg"></i>
      </button>
    </div>
  );
}
