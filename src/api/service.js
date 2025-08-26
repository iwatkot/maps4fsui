/**
 * API functions for backend service information and connectivity
 */

import apiService from '../utils/apiService';
import logger from '../utils/logger';

/**
 * Get backend version and connectivity status
 * @returns {Promise<object>} - Object with version info
 * 
 * Example response:
 * {
 *   "version": "2.2.7"
 * }
 */
export async function getBackendVersion() {
  try {
    logger.info('Checking backend version and connectivity');
    
    const response = await apiService.get('/info/version');
    
    logger.info(`Backend version: ${response.version}`);
    return response;
  } catch (error) {
    logger.error('Failed to get backend version:', error.message);
    throw error;
  }
}
