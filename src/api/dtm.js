/**
 * API functions for DTM (Digital Terrain Model) operations
 * These functions use the centralized ApiService
 */

import apiService from '../utils/apiService';
import logger from '../utils/logger';
import { constraints } from '../config/formOptions';

/**
 * Validate coordinate string input
 * @param {string} value - Coordinate string (e.g., "lat, lon")
 * @returns {boolean} - Whether the coordinates are valid
 */
export const validateCoordinates = (value) => {
  // Remove extra whitespace and split by comma or whitespace
  const trimmed = value.trim();
  if (!trimmed) return false;
  
  // Split by comma or whitespace (or both)
  const parts = trimmed.split(/[,\s]+/).filter(part => part.length > 0);
  
  // Must have exactly 2 parts
  if (parts.length !== 2) return false;
  
  // Both parts must be valid floats
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  // Check if parsing was successful (not NaN) and values are reasonable coordinates
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= constraints.coordinates.minLat && lat <= constraints.coordinates.maxLat &&
         lng >= constraints.coordinates.minLng && lng <= constraints.coordinates.maxLng;
};

/**
 * Parse coordinate string into lat/lon object
 * @param {string} value - Coordinate string (e.g., "lat, lon")
 * @returns {object|null} - {lat, lon} object or null if invalid
 */
export const parseCoordinates = (value) => {
  if (!validateCoordinates(value)) return null;
  
  const trimmed = value.trim();
  const parts = trimmed.split(/[,\s]+/).filter(part => part.length > 0);
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  
  return { lat, lon };
};

/**
 * Get available DTM providers for given coordinates
 * @param {number} lat - Latitude coordinate
 * @param {number} lon - Longitude coordinate
 * @returns {Promise<object>} - Object with provider keys and display names
 * 
 * Example response:
 * {
 *   "srtm30": "🌎 Global [30.0 m/px] SRTM 30 m",
 *   "arctic": "🌍 Global [2.0 m/px] ArcticDEM",
 *   "finland": "🇫🇮 FI [2.0 m/px] Finland",
 *   "norway": "🇳🇴 NO [1.0 m/px] Norway Topobathy"
 * }
 */
export async function getDTMProviders(lat, lon) {
  try {
    logger.info(`Getting DTM providers for coordinates: ${lat}, ${lon}`);
    
    const response = await apiService.post('/dtm/list', {
      lat: lat,
      lon: lon
    });

    logger.info(`Retrieved ${Object.keys(response).length} DTM providers`);
    logger.debug('DTM providers:', response);
    
    return response;
  } catch (error) {
    logger.error('Failed to get DTM providers:', error.message);
    throw error;
  }
}