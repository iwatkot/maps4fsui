'use client';

import { useState, useEffect } from 'react';
import config from '@/app/config';
import { getAuthenticatedImageUrl, revokeBlobUrl } from '@/utils/authenticatedFetch';

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
  const [imageBlobUrls, setImageBlobUrls] = useState({});

  // Load authenticated image URLs
  useEffect(() => {
    if (!previews) return;

    const loadImages = async () => {
      const newBlobUrls = {};
      
      for (let i = 0; i < previews.length; i++) {
        const preview = previews[i];
        if (!imageBlobUrls[i] && !imageErrors[i]) {
          setLoadingImages(prev => ({ ...prev, [i]: true }));
          
          try {
            let blobUrl;
            // Handle local files differently - no authentication needed
            if (preview.isLocal) {
              blobUrl = preview.url; // Use direct URL for local files
            } else {
              // Use authenticated fetch for backend API files
              blobUrl = await getAuthenticatedImageUrl(preview.url);
            }
            newBlobUrls[i] = blobUrl;
            setLoadingImages(prev => ({ ...prev, [i]: false }));
          } catch (error) {
            console.error(`Failed to load image ${i}:`, error);
            setImageErrors(prev => ({ ...prev, [i]: true }));
            setLoadingImages(prev => ({ ...prev, [i]: false }));
            if (onError) {
              onError(`Failed to load preview: ${preview.filename}`);
            }
          }
        }
      }
      
      if (Object.keys(newBlobUrls).length > 0) {
        setImageBlobUrls(prev => ({ ...prev, ...newBlobUrls }));
      }
    };

    loadImages();
  }, [previews, imageBlobUrls, imageErrors, onError]);

  // Cleanup blob URLs on unmount (only for authenticated images)
  useEffect(() => {
    return () => {
      Object.entries(imageBlobUrls).forEach(([index, blobUrl]) => {
        // Only revoke blob URLs for authenticated images, not local file URLs
        if (previews && previews[index] && !previews[index].isLocal && blobUrl.startsWith('blob:')) {
          revokeBlobUrl(blobUrl);
        }
      });
    };
  }, [imageBlobUrls, previews]);

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

  const handlePreviousImage = () => {
    if (selectedImage && selectedImage.index > 0) {
      const prevIndex = selectedImage.index - 1;
      setSelectedImage({ ...previews[prevIndex], index: prevIndex });
    }
  };

  const handleNextImage = () => {
    if (selectedImage && selectedImage.index < previews.length - 1) {
      const nextIndex = selectedImage.index + 1;
      setSelectedImage({ ...previews[nextIndex], index: nextIndex });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getImageUrl = (preview, index) => {
    // Only use blob URL if available, don't fallback to unauthenticated direct URL
    return imageBlobUrls[index] || null;
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
      <div className="absolute inset-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-3 p-4">
            {previews.map((preview, index) => (
              <div
                key={`${taskId}-${index}`}
                className="group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-lg aspect-square"
                onClick={() => handleImageClick(preview, index)}
              >
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {imageErrors[index] ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <div className="text-2xl mb-2">❌</div>
                      <div className="text-xs text-center px-2">Failed to load</div>
                    </div>
                  ) : imageBlobUrls[index] ? (
                    <img
                      src={imageBlobUrls[index]}
                      alt={preview.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index, preview)}
                    />
                  ) : null}
                  
                  {/* Overlay with filename */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
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
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && imageBlobUrls[selectedImage.index] && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative inline-block">
            <img
              src={imageBlobUrls[selectedImage.index]}
              alt={selectedImage.filename}
              className="max-w-full max-h-full object-contain block"
              style={{ maxHeight: 'calc(100vh - 2rem)', maxWidth: 'calc(100vw - 2rem)' }}
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              title="Close preview"
            >
              <i className="zmdi zmdi-close text-lg"></i>
            </button>

            {/* Previous button */}
            {selectedImage.index > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
                title="Previous image"
              >
                <i className="zmdi zmdi-chevron-left text-xl"></i>
              </button>
            )}

            {/* Next button */}
            {selectedImage.index < previews.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
                title="Next image"
              >
                <i className="zmdi zmdi-chevron-right text-xl"></i>
              </button>
            )}

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
