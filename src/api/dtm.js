/**
 * API functions for DTM (Digital Terrain Model) operations
 * These functions use the centralized ApiService
 */

import apiService from '../utils/apiService';
import logger from '../utils/logger';

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

export async function isDTMCodeValid(dtmCode) {
  try {
    logger.info(`Validating DTM code: ${dtmCode}`);
    
    const response = await apiService.post('/dtm/info', { code: dtmCode });

    // If we get a response without error, the DTM code is valid
    logger.info(`DTM code ${dtmCode} is valid`);
    return true;
  } catch (error) {
    logger.error('Failed to validate DTM code:', error.message);
    // If the API returns an error (like 404), the DTM code is invalid
    return false;
  }
}