import apiService from '@/utils/apiService';
import config from '@/app/config';

/**
 * Fetch an authenticated image URL as a blob URL
 * @param {string} url - The relative URL from the API or full URL
 * @returns {Promise<string>} - Blob URL for the image
 */
export async function getAuthenticatedImageUrl(url) {
  try {
    // Check if URL is already full URL or just relative path
    const fullUrl = url.startsWith('http') ? url : `${config.backendUrl}${url}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: apiService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching authenticated image:', error);
    throw error;
  }
}

/**
 * Fetch an authenticated STL file as a blob URL
 * @param {string} url - The relative URL from the API or full URL
 * @returns {Promise<string>} - Blob URL for the STL file
 */
export async function getAuthenticatedStlUrl(url) {
  try {
    // Check if URL is already full URL or just relative path
    const fullUrl = url.startsWith('http') ? url : `${config.backendUrl}${url}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: apiService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch STL: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching authenticated STL:', error);
    throw error;
  }
}

/**
 * Authenticated fetch for API calls
 * @param {string} url - The URL (can be relative or absolute)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export async function getAuthenticatedFetch(url, options = {}) {
  try {
    // For relative URLs (starting with /), make them relative to current origin
    // For full URLs, use as-is
    const fetchUrl = url.startsWith('/') ? url : url.startsWith('http') ? url : `${config.backendUrl}${url}`;
    
    const response = await fetch(fetchUrl, {
      ...options,
      headers: {
        ...apiService.getHeaders(),
        ...options.headers
      }
    });

    return response;
  } catch (error) {
    console.error('Error in authenticated fetch:', error);
    throw error;
  }
}

/**
 * Cleanup blob URLs to prevent memory leaks
 * @param {string} blobUrl - The blob URL to revoke
 */
export function revokeBlobUrl(blobUrl) {
  if (blobUrl && blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
  }
}
