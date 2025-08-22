import apiService from '@/utils/apiService';
import { preprocessMainSettings, objectToSnakeCase } from '@/api/preprocess';
import logger from '@/utils/logger';

/**
 * Start map generation process
 * @param {Object} settings - Main settings from the UI
 * @returns {Promise<Object>} - API response with task_id or error
 */
export async function startMapGeneration(settings) {
  try {
    logger.info('Starting map generation process');
    
    // Step 1: Preprocess main settings (camelCase)
    const mainSettings = settings.mainSettings;
    const generationSettings = settings.generationSettings;
    const processedMainSettings = await preprocessMainSettings(mainSettings);
    
    // Step 2: Convert to snake_case for API
    logger.debug('Converting to snake_case for API');
    const payload = objectToSnakeCase(processedMainSettings);
    for (const [key, value] of Object.entries(generationSettings)) {
      const sectionSettings = value;
      const processedSectionSettings = objectToSnakeCase(sectionSettings);
      payload[key] = processedSectionSettings;
    }

    logger.info('Sending generation request to /map/generate');
    
    // Step 3: Send to /map/generate endpoint using apiService
    const data = await apiService.post('/map/generate', payload);
    
    logger.info(`Generation started successfully with task ID: ${data.task_id}`);
    
    return {
      success: true,
      taskId: data.task_id,
      description: data.description
    };
    
  } catch (error) {
    logger.error('Map generation failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check task status
 * @param {string} taskId - Task ID from generation start
 * @returns {Promise<Object>} - Status response
 */
export async function checkTaskStatus(taskId) {
  try {
    logger.debug(`Checking task status for: ${taskId}`);
    
    // Use apiService raw response to handle special status codes
    const response = await apiService.postRaw('/task/status', { task_id: taskId });
    
    logger.debug(`Task status response: ${response.status} ${response.statusText}`);
    
    // Handle different status codes
    if (response.status === 204) {
      // Task is in queue, processing not started
      logger.info('Task is queued, waiting to start');
      return {
        status: 'queued',
        message: 'Task is in queue'
      };
    }
    
    if (response.status === 202) {
      // Task is processing
      logger.info('Task is being processed');
      return {
        status: 'processing',
        message: 'Task is being processed'
      };
    }
    
    if (response.status === 200) {
      // Task completed successfully
      const data = await response.json();
      logger.info('Task completed successfully');
      return {
        status: 'completed',
        message: data.description,
        taskId: data.task_id
      };
    }
    
    // Handle 4xx errors
    if (response.status >= 400 && response.status < 500) {
      const errorData = await response.json();
      logger.error(`Task failed with client error: ${errorData.detail}`);
      throw new Error(errorData.detail || `Task failed with status ${response.status}`);
    }
    
    // Handle other errors
    logger.error(`Unexpected status code: ${response.status}`);
    throw new Error(`Unexpected status code: ${response.status}`);
    
  } catch (error) {
    logger.error('Task status check failed:', error.message);
    return {
      status: 'failed',
      error: error.message
    };
  }
}

/**
 * Download generated map file from completed task
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} - Download response
 */
export async function downloadGeneratedMap(taskId) {
  logger.info(`Downloading generated map for task: ${taskId}`);
  
  try {
    // Use apiService's new downloadFile method
    return await apiService.downloadFile('/task/get', { task_id: taskId }, `${taskId}.zip`);
    
  } catch (error) {
    logger.error('Download failed:', error.message);
    throw error; // Re-throw so the hook can handle it
  }
}

export async function generateMap(data) {}