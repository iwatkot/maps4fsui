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

/**
 * Get backend version status information
 * @returns {Promise<object>} - Object with version status info
 * 
 * Example response:
 * {
 *   "current_version": "2.2.7",
 *   "latest_version": "2.3.0", 
 *   "is_latest": false
 * }
 */
export async function getBackendVersionStatus() {
  try {
    logger.info('Checking backend version status');
    
    const response = await apiService.get('/info/status');
    
    logger.info(`Backend version status: current=${response.current_version}, latest=${response.latest_version}, is_latest=${response.is_latest}`);
    return response;
  } catch (error) {
    logger.error('Failed to get backend version status:', error.message);
    throw error;
  }
}
