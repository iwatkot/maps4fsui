import apiService from '@/utils/apiService';
import { preprocessMainSettings, objectToSnakeCase } from '@/api/preprocess';
import logger from '@/utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Start map generation process
 * @param {Object} settings - Main settings from the UI
 * @returns {Promise<Object>} - API response with task_id or error
 */
export async function startMapGeneration(settings) {
  try {
    logger.info('Starting map generation process');
    
    // Step 1: Preprocess main settings (camelCase)
    logger.debug('Preprocessing settings');
    const processedSettings = await preprocessMainSettings(settings);
    
    // Step 2: Convert to snake_case for API
    logger.debug('Converting to snake_case for API');
    const payload = objectToSnakeCase(processedSettings);
    
    logger.info('Sending generation request to /map/generate');
    
    // Step 3: Send to /map/generate endpoint
    const response = await fetch(`${API_BASE_URL}/map/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      logger.error(`Generation request failed: ${data.detail || response.statusText}`);
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }
    
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
    
    const response = await fetch(`${API_BASE_URL}/task/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_id: taskId }),
    });
    
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
 * Download generated map file (placeholder for next step)
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} - Download response
 */
export async function downloadGeneratedMap(taskId) {
  logger.info(`Starting download for task: ${taskId}`);
  
  // TODO: Implement actual download logic
  logger.warn('Using placeholder download - will be implemented in next step');
  
  // For now, download the placeholder file
  const link = document.createElement('a');
  link.href = '/next.svg';
  link.download = `generated-map-${taskId}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  logger.info('Placeholder file downloaded successfully');
  
  return {
    success: true,
    message: 'File downloaded successfully'
  };
}

export async function generateMap(data) {}