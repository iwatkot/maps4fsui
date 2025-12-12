'use client';

import { useState, useMemo } from 'react';
import PreviewGallery from './PreviewGallery';
import StlViewer from './StlViewer';
import { separateFilesByType } from '@/utils/fileTypeUtils';
import config from '@/app/config';

/**
 * Mixed Preview Gallery - Handles both PNG previews and STL models
 * Shows PNG gallery on one page and STL models on separate pages
 * @param {array} previews - Array of all preview files (PNG and STL)
 * @param {string} taskId - Task ID for the previews
 * @param {number} currentPage - Current active page
 * @param {function} onError - Optional error callback
 */
export default function MixedPreviewGallery({ previews, taskId, currentPage, onError }) {
  const [stlErrors, setStlErrors] = useState({});

  // Separate files by type
  const { pngPreviews, stlModels } = useMemo(() => {
    return separateFilesByType(previews);
  }, [previews]);

  const handleStlError = (stlIndex, error) => {
    setStlErrors(prev => ({ ...prev, [stlIndex]: error }));
    if (onError) {
      onError(error);
    }
  };

  const getStlUrl = (stlFile) => {
    // For local files, use the URL as-is. For backend files, add the backend URL prefix
    if (stlFile.isLocal) {
      return stlFile.url;
    }
    return `${config.backendUrl}${stlFile.url}`;
  };

  // Calculate total pages: 1 for PNG gallery (if any) + 1 per STL file
  const hasPngPreviews = pngPreviews && pngPreviews.length > 0;
  const totalPages = (hasPngPreviews ? 1 : 0) + (stlModels ? stlModels.length : 0);

  if (totalPages === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-3xl mb-3">📁</div>
        <div className="text-lg font-medium">No Previews Available</div>
        <div className="text-sm">Preview files will appear here after generation</div>
      </div>
    );
  }

  // Determine what to show on current page
  let pageContent;
  let pageInfo = '';

  if (currentPage === 0 && hasPngPreviews) {
    // First page: PNG Gallery
    pageContent = (
      <PreviewGallery
        key={taskId} // Force re-mount when taskId changes
        previews={pngPreviews}
        taskId={taskId}
        onError={onError}
      />
    );
    pageInfo = `Image Previews (${pngPreviews.length})`;
  } else {
    // STL pages
    const stlPageIndex = hasPngPreviews ? currentPage - 1 : currentPage;
    
    if (stlPageIndex >= 0 && stlPageIndex < stlModels.length) {
      const stlFile = stlModels[stlPageIndex];
      
      pageContent = (
        <StlViewer
          url={getStlUrl(stlFile)}
          filename={stlFile.filename}
          size={stlFile.size}
          isLocal={stlFile.isLocal}
          onError={(error) => handleStlError(stlPageIndex, error)}
        />
      );
      pageInfo = `3D Model ${stlPageIndex + 1} of ${stlModels.length}`;
    } else {
      // Invalid page
      pageContent = (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-3">❓</div>
          <div className="text-lg font-medium">Page Not Found</div>
          <div className="text-sm">Invalid page index</div>
        </div>
      );
      pageInfo = 'Error';
    }
  }

  return (
    <div className="w-full h-full relative">
      {pageContent}
      
      {/* Page indicator */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm z-10">
        <div className="font-medium">{pageInfo}</div>
        <div className="text-xs opacity-80">
          Page {currentPage + 1} of {totalPages}
        </div>
      </div>

      {/* File type legend */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs z-10">
        <div className="space-y-1">
          {hasPngPreviews && (
            <div className="flex items-center space-x-2">
              <span>🖼️</span>
              <span>{pngPreviews.length} Image{pngPreviews.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {stlModels.length > 0 && (
            <div className="flex items-center space-x-2">
              <span>🗿</span>
              <span>{stlModels.length} 3D Model{stlModels.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
