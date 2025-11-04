'use client';

import config from '../app/config';
import logger from './logger';

class ApiService {
  constructor() {
    this.baseUrl = config.backendUrl;
    this.bearerToken = config.bearerToken;
    this.lastNoBearerTokenLog = 0; // Throttle bearer token warning
    this.noBearerTokenLogInterval = 30000; // Log at most every 30 seconds
  }

  /**
   * Get headers for API requests
   * Automatically includes bearer token if available
   */
  getHeaders(additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    // Add bearer token if available
    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    } else {
      // Throttle the no bearer token message to prevent spam
      const now = Date.now();
      if (now - this.lastNoBearerTokenLog > this.noBearerTokenLogInterval) {
        logger.info('No bearer token configured - making request without authentication');
        this.lastNoBearerTokenLog = now;
      }
    }

    return headers;
  }

  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint (e.g., '/info/version')
   * @param {object} options - Additional options (headers, etc.)
   * @returns {Promise} - Response data or throws error
   */
  async get(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      logger.info(`Making GET request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(options.headers),
        ...options
      });

      logger.info(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorData;
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          // Try to parse as JSON first to get the detail field
          errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (jsonError) {
          // If JSON parsing fails, fall back to text
          errorData = await response.text();
          if (errorData) {
            errorMessage = errorData;
          }
        }
        
        logger.error(`API Error: ${response.status} - ${errorMessage}`);
        throw new ApiError(errorMessage, response.status, errorData);
      }

      // Check if response body is empty
      const contentLength = response.headers.get('Content-Length');
      const responseText = await response.text();
      
      // Handle empty responses silently
      if (!responseText || responseText.trim() === '' || contentLength === '0') {
        return {}; // Return empty object for empty responses
      }

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        responseData = { message: responseText };
      }
      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Provide better error message for common network issues
      let errorMessage = `Network error: ${error.message}`;
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Backend service unavailable. Unable to connect to the server. Please check if the backend is running or try again later.';
      }
      
      throw new ApiError(errorMessage, 0, error);
    }
  }

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint (e.g., '/generate-map')
   * @param {object} data - Request payload
   * @param {object} options - Additional options (headers, etc.)
   * @returns {Promise} - Response data or throws error
   */
  async post(endpoint, data = {}, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      logger.info(`Making POST request to: ${url}`);
      logger.debug('Request payload:', data);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options
      });

      logger.info(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorData;
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          // Try to parse as JSON first to get the detail field
          errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (jsonError) {
          // If JSON parsing fails, fall back to text
          errorData = await response.text();
          if (errorData) {
            errorMessage = errorData;
          }
        }
        
        logger.error(`API Error: ${response.status} - ${errorMessage}`);
        throw new ApiError(errorMessage, response.status, errorData);
      }

      // Check if response body is empty
      const contentLength = response.headers.get('Content-Length');
      const responseText = await response.text();
      
      // Handle empty responses silently
      if (!responseText || responseText.trim() === '' || contentLength === '0') {
        return {}; // Return empty object for empty responses
      }

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        responseData = { message: responseText };
      }
      
      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Network error:', error.message);
      
      // Provide better error message for common network issues
      let errorMessage = `Network error: ${error.message}`;
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Backend service unavailable: Unable to connect to the server. Please check if the backend is running or try again later.';
      }
      
      throw new ApiError(errorMessage, 0, error);
    }
  }

  /**
   * Make a POST request for file uploads (multipart/form-data)
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with files
   * @param {object} options - Additional options
   * @returns {Promise} - Response data or throws error
   */
  async postFormData(endpoint, formData, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      logger.info(`Making POST (form-data) request to: ${url}`);

      // Get headers without Content-Type for form data (browser sets it automatically)
      const headers = this.getHeaders(options.headers);
      delete headers['Content-Type']; // Let browser set multipart boundary

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
        ...options
      });

      logger.info(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.text();
        logger.error(`API Error: ${response.status} - ${errorData}`);
        throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, errorData);
      }

      const responseData = await response.json();
      logger.debug('Response data:', responseData);
      
      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Provide better error message for common network issues
      let errorMessage = `Network error: ${error.message}`;
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Backend service unavailable: Unable to connect to the server. Please check if the backend is running or try again later.';
      }
      
      throw new ApiError(errorMessage, 0, error);
    }
  }

  /**
   * Check if API is available
   * @returns {Promise<boolean>} - True if API is responding
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (error) {
      logger.error('Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Make a POST request with raw response handling (for custom status code logic)
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request payload
   * @param {object} options - Additional options
   * @returns {Promise<Response>} - Raw response object
   */
  async postRaw(endpoint, data = {}, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      logger.info(`Making POST (raw) request to: ${url}`);
      logger.debug('Request payload:', data);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options
      });

      logger.info(`Response status: ${response.status} ${response.statusText}`);
      return response; // Return raw response for custom handling
      
    } catch (error) {
      // Provide better error message for common network issues
      let errorMessage = `Network error: ${error.message}`;
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Backend service unavailable: Unable to connect to the server. Please check if the backend is running or try again later.';
      }
      
      throw new ApiError(errorMessage, 0, error);
    }
  }

  /**
   * Download a file from API endpoint
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request payload
   * @param {string} defaultFilename - Default filename if not provided by server
   * @returns {Promise<Object>} - Download result with success/filename info
   */
  async downloadFile(endpoint, data = {}, defaultFilename = 'download.zip') {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      logger.info(`Making file download request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.detail || `Download failed with status ${response.status}`, response.status, errorData);
      }

      logger.info('File received from API, starting download');

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = defaultFilename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const link = document.createElement('a');
      const url_obj = window.URL.createObjectURL(blob);
      
      link.href = url_obj;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_obj);

      logger.info(`File downloaded successfully: ${filename}`);

      return {
        success: true,
        message: `File downloaded successfully: ${filename}`,
        filename: filename
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Download failed:', error.message);
      throw new ApiError(`Download error: ${error.message}`, 0, error);
    }
  }

  /**
   * Get current queue size from backend (public version only)
   * @returns {Promise<number>} - Current queue size
   */
  async getQueueSize() {
    try {
      logger.info('Checking queue size');
      const response = await this.get('/info/queue_size');
      logger.debug('Queue size response:', response);
      return response.queue_size || 0;
    } catch (error) {
      logger.error('Failed to get queue size:', error.message);
      return 0; // Return 0 if we can't get queue size (assume not overloaded)
    }
  }

  /**
   * Get the full URL for an endpoint
   * @param {string} endpoint - API endpoint
   * @returns {string} - Full URL
   */
  getUrl(endpoint) {
    return `${this.baseUrl}${endpoint}`;
  }
}

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export both the instance and the error class
export { apiService as default, ApiError };
