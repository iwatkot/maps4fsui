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
    console.log('Fetching authenticated image from:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: apiService.getHeaders(),
    });

    console.log('Image fetch response:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    console.log('Image blob created:', blob.size, 'bytes, type:', blob.type);
    const blobUrl = URL.createObjectURL(blob);
    console.log('Image blob URL created:', blobUrl);
    return blobUrl;
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
 * Cleanup blob URLs to prevent memory leaks
 * @param {string} blobUrl - The blob URL to revoke
 */
export function revokeBlobUrl(blobUrl) {
  if (blobUrl && blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
  }
}
