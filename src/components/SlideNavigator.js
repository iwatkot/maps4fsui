'use client';

/**
 * SlideNavigator - Overlay-style navigation component for switching between pages
 * Appears as floating elements over the content
 * @param {number} currentPage - Current active page (0-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {string} className - Additional CSS classes for positioning
 */
export default function SlideNavigator({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Left Arrow */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`
          absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-200 z-10
          ${currentPage === 0 
            ? 'bg-black/20 text-white/40 cursor-not-allowed' 
            : 'bg-black/50 hover:bg-black/70 text-white hover:scale-110 shadow-lg'
          }
        `}
        title="Previous page"
      >
        <i className="zmdi zmdi-chevron-left text-xl"></i>
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={`
          absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-200 z-10
          ${currentPage === totalPages - 1
            ? 'bg-black/20 text-white/40 cursor-not-allowed'
            : 'bg-black/50 hover:bg-black/70 text-white hover:scale-110 shadow-lg'
          }
        `}
        title="Next page"
      >
        <i className="zmdi zmdi-chevron-right text-xl"></i>
      </button>

      {/* Page Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
          <span className="text-white text-sm font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          <div className="flex items-center space-x-1.5">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index)}
                className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-200
                  ${currentPage === index
                    ? 'bg-white scale-125 shadow-sm'
                    : 'bg-white/40 hover:bg-white/70 hover:scale-110'
                  }
                `}
                title={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
