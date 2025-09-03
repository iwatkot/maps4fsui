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
      {/* Combined Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-2 flex items-center space-x-3">
          {/* Left Arrow */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-200
              ${currentPage === 0 
                ? 'text-white/30 cursor-not-allowed' 
                : 'text-white hover:bg-white/20 hover:scale-110'
              }
            `}
            title="Previous page"
          >
            <i className="zmdi zmdi-chevron-left text-lg"></i>
          </button>

          {/* Page Info and Dots */}
          <div className="flex items-center space-x-2">
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

          {/* Right Arrow */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-200
              ${currentPage === totalPages - 1
                ? 'text-white/30 cursor-not-allowed'
                : 'text-white hover:bg-white/20 hover:scale-110'
              }
            `}
            title="Next page"
          >
            <i className="zmdi zmdi-chevron-right text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
