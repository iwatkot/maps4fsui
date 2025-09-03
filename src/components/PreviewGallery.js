'use client';

import { useState } from 'react';
import config from '@/app/config';

/**
 * PreviewGallery - Gallery component for displaying preview images
 * @param {array} previews - Array of preview objects with url, filename, size properties
 * @param {string} taskId - Task ID for the previews
 * @param {function} onError - Optional error callback
 */
export default function PreviewGallery({ previews, taskId, onError }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  const handleImageLoad = (index) => {
    setLoadingImages(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index, preview) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    setLoadingImages(prev => ({ ...prev, [index]: false }));
    if (onError) {
      onError(`Failed to load preview: ${preview.filename}`);
    }
  };

  const handleImageClick = (preview, index) => {
    setSelectedImage({ ...preview, index });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getImageUrl = (preview) => {
    // Use the full URL from the API response
    return `${config.backendUrl}${preview.url}`;
  };

  if (!previews || previews.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-3xl mb-3">🖼️</div>
        <div className="text-lg font-medium">No Previews Available</div>
        <div className="text-sm">Preview images will appear here after generation</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full overflow-auto">
        <div className="grid grid-cols-2 gap-4 p-4">
          {previews.map((preview, index) => (
            <div
              key={`${taskId}-${index}`}
              className="group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-lg"
              onClick={() => handleImageClick(preview, index)}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {loadingImages[index] !== false && !imageErrors[index] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400 dark:text-gray-500">
                      <div className="animate-spin text-2xl">⏳</div>
                    </div>
                  </div>
                )}
                
                {imageErrors[index] ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <div className="text-2xl mb-2">❌</div>
                    <div className="text-xs text-center px-2">Failed to load</div>
                  </div>
                ) : (
                  <img
                    src={getImageUrl(preview)}
                    alt={preview.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index, preview)}
                    style={{ display: loadingImages[index] === false || imageErrors[index] ? 'block' : 'none' }}
                  />
                )}
                
                {/* Overlay with filename */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-white text-xs font-medium truncate">
                    {preview.filename}
                  </div>
                  <div className="text-white/70 text-xs">
                    {formatFileSize(preview.size)}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-2">
                    <i className="zmdi zmdi-zoom-in text-gray-700 dark:text-gray-300 text-lg"></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={getImageUrl(selectedImage)}
              alt={selectedImage.filename}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              title="Close preview"
            >
              <i className="zmdi zmdi-close text-lg"></i>
            </button>

            {/* Image info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-3 text-white">
              <div className="font-medium">{selectedImage.filename}</div>
              <div className="text-sm opacity-80">
                {formatFileSize(selectedImage.size)} • Preview {selectedImage.index + 1} of {previews.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
