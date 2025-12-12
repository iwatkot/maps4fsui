/**
 * API functions for schema management
 */

import apiService from '../utils/apiService';
import logger from '../utils/logger';

/**
 * Get texture schema for a specific game
 * @param {string} gameCode - Game code (fs22, fs25)
 * @returns {Promise<Array>} - Array of texture objects
 * 
 * Example request payload:
 * {
 *   "game_code": "fs25",
 *   "schema_type": "texture"
 * }
 * 
 * Example response:
 * [
 *   {
 *     "name": "asphalt",
 *     "count": 2,
 *     "tags": {...},
 *     "width": 8,
 *     "color": [70, 70, 70],
 *     "priority": 1
 *   }
 * ]
 */
export async function getTextureSchema(gameCode = 'fs25') {
  try {
    // logger.info(`Loading texture schema for game: ${gameCode}`);
    
    const response = await apiService.post('/templates/schemas', {
      game_code: gameCode,
      schema_type: 'texture'
    });
    
    // logger.info(`Loaded ${response.length} texture entries`);
    return response;
  } catch (error) {
    logger.error('Failed to load texture schema:', error.message);
    throw error;
  }
}

/**
 * Get tree schema for a specific game
 * @param {string} gameCode - Game code (fs22, fs25)
 * @returns {Promise<Array>} - Array of tree objects
 * 
 * Example request payload:
 * {
 *   "game_code": "fs25",
 *   "schema_type": "tree"
 * }
 * 
 * Example response:
 * [
 *   {
 *     "name": "birch",
 *     "tags": {...},
 *     "models": [...],
 *     "probability": 0.8
 *   }
 * ]
 */
export async function getTreeSchema(gameCode = 'fs25') {
  try {
    // logger.info(`Loading tree schema for game: ${gameCode}`);
    
    const response = await apiService.post('/templates/schemas', {
      game_code: gameCode,
      schema_type: 'tree'
    });
    
    // logger.info(`Loaded ${response.length} tree entries`);
    return response;
  } catch (error) {
    logger.error('Failed to load tree schema:', error.message);
    throw error;
  }
}

/**
 * Get GRLE schema for a specific game
 * @param {string} gameCode - Game code (fs22, fs25)
 * @returns {Promise<Array>} - Array of GRLE objects
 * 
 * Example request payload:
 * {
 *   "game_code": "fs25",
 *   "schema_type": "grle"
 * }
 */
export async function getGrleSchema(gameCode = 'fs25') {
  try {
    // logger.info(`Loading GRLE schema for game: ${gameCode}`);
    
    const response = await apiService.post('/templates/schemas', {
      game_code: gameCode,
      schema_type: 'grle'
    });
    
    // logger.info(`Loaded ${response.length} GRLE entries`);
    return response;
  } catch (error) {
    logger.error('Failed to load GRLE schema:', error.message);
    throw error;
  }
}
