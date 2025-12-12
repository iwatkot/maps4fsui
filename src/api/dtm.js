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
    // logger.info(`Getting DTM providers for coordinates: ${lat}, ${lon}`);
    
    const response = await apiService.post('/dtm/list', {
      lat: lat,
      lon: lon
    });

    // logger.info(`Retrieved ${Object.keys(response).length} DTM providers`);
    // logger.debug('DTM providers:', response);
    
    return response;
  } catch (error) {
    logger.error('Failed to get DTM providers:', error.message);
    throw error;
  }
}

/**
 * Get DTM provider information including settings configuration
 * @param {string} providerCode - The DTM provider code
 * @returns {Promise<object>} - Provider information and settings
 * 
 * Example response:
 * {
 *   "valid": true,
 *   "provider": "Switzerland DGM1",
 *   "settings_required": true,
 *   "settings": {
 *     "api_key": "str",
 *     "dataset": {"mv_dgm": "Mecklenburg-Vorpommern DGM1", "mv_dgm5": "..."},
 *     "resolution": ["0.5", "2.0"]
 *   }
 * }
 */
export async function getDTMProviderInfo(providerCode) {
  try {
    // logger.info(`Getting DTM provider info for: ${providerCode}`);
    
    const response = await apiService.post('/dtm/info', { code: providerCode });

    // logger.info(`Retrieved DTM provider info for ${providerCode}`);
    // logger.debug('DTM provider info:', response);
    
    return response;
  } catch (error) {
    logger.error('Failed to get DTM provider info:', error.message);
    throw error;
  }
}

export async function isDTMCodeValid(dtmCode) {
  try {
    // logger.info(`Validating DTM code: ${dtmCode}`);
    
    const response = await apiService.post('/dtm/info', { code: dtmCode });

    // If we get a response without error, the DTM code is valid
    // logger.info(`DTM code ${dtmCode} is valid`);
    return { isValid: true };
  } catch (error) {
    logger.error('Failed to validate DTM code:', error.message);
    
    // Check if this is a network/backend error vs validation error
    if (error.message.includes('Backend service unavailable') || 
        error.message.includes('Network error') ||
        error.message.includes('Failed to fetch')) {
      // Return network error info
      return { 
        isValid: false, 
        isNetworkError: true, 
        errorMessage: error.message 
      };
    }
    
    // For HTTP errors (like 404), treat as invalid DTM code
    if (error.status >= 400 && error.status < 500) {
      return { 
        isValid: false, 
        isNetworkError: false, 
        errorMessage: `DTM code '${dtmCode}' is not recognized or supported` 
      };
    }
    
    // For other errors, return as network error to be safe
    return { 
      isValid: false, 
      isNetworkError: true, 
      errorMessage: error.message 
    };
  }
}