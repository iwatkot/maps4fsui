/**
 * Utility functions for handling different file types in previews
 */

/**
 * Check if a file is a PNG image
 * @param {Object} file - File object with filename property
 * @returns {boolean}
 */
export function isPngFile(file) {
  return file.filename && file.filename.toLowerCase().endsWith('.png');
}

/**
 * Check if a file is an STL file
 * @param {Object} file - File object with filename property
 * @returns {boolean}
 */
export function isStlFile(file) {
  return file.filename && file.filename.toLowerCase().endsWith('.stl');
}

/**
 * Separate files into PNG previews and STL models
 * @param {Array} files - Array of file objects
 * @returns {Object} - Object with pngPreviews and stlModels arrays
 */
export function separateFilesByType(files) {
  if (!files || !Array.isArray(files)) {
    return {
      pngPreviews: [],
      stlModels: []
    };
  }

  return {
    pngPreviews: files.filter(isPngFile),
    stlModels: files.filter(isStlFile)
  };
}

/**
 * Get the file extension from a filename
 * @param {string} filename - The filename
 * @returns {string} - The file extension (without the dot)
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }
  
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Check if a file type is supported for preview
 * @param {Object} file - File object with filename property
 * @returns {boolean}
 */
export function isSupportedPreviewType(file) {
  return isPngFile(file) || isStlFile(file);
}
