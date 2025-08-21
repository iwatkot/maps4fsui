import apiService from '@/utils/apiService';
import { preprocessMainSettings } from '@/api/preprocess';
import { objectToSnakeCase } from '@/utils/apiService';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Start map generation process
 * @param {Object} settings - Main settings from the UI
 * @returns {Promise<Object>} - API response with task_id or error
 */
export async function startMapGeneration(settings) {
  try {
    // Step 1: Preprocess main settings (camelCase)
    const processedSettings = await preprocessMainSettings(settings);
    
    // Step 2: Convert to snake_case for API
    const payload = objectToSnakeCase(processedSettings);
    
    console.log('Sending payload to API:', payload);
    
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
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }
    
    return {
      success: true,
      taskId: data.task_id,
      description: data.description
    };
    
  } catch (error) {
    console.error('Map generation failed:', error);
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
    const response = await fetch(`${API_BASE_URL}/task/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_id: taskId }),
    });
    
    // Handle different status codes
    if (response.status === 204) {
      // Task is in queue, processing not started
      return {
        status: 'queued',
        message: 'Task is in queue'
      };
    }
    
    if (response.status === 202) {
      // Task is processing
      return {
        status: 'processing',
        message: 'Task is being processed'
      };
    }
    
    if (response.status === 200) {
      // Task completed successfully
      const data = await response.json();
      return {
        status: 'completed',
        message: data.description,
        taskId: data.task_id
      };
    }
    
    // Handle 4xx errors
    if (response.status >= 400 && response.status < 500) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Task failed with status ${response.status}`);
    }
    
    // Handle other errors
    throw new Error(`Unexpected status code: ${response.status}`);
    
  } catch (error) {
    console.error('Task status check failed:', error);
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
  // TODO: Implement actual download logic
  console.log('Download would be implemented here for task:', taskId);
  
  // For now, download the placeholder file
  const link = document.createElement('a');
  link.href = '/next.svg';
  link.download = `generated-map-${taskId}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return {
    success: true,
    message: 'File downloaded successfully'
  };
}

export async function generateMap(data) {}