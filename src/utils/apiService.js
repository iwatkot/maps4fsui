'use client';

import config from '../app/config';
import logger from './logger';

class ApiService {
  constructor() {
    this.baseUrl = config.backendUrl;
    this.bearerToken = config.bearerToken;
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
      logger.info('Using bearer token for API request');
    } else {
      logger.info('No bearer token configured - making request without authentication');
    }

    return headers;
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
      
      logger.error('Network error:', error.message);
      throw new ApiError(`Network error: ${error.message}`, 0, error);
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
      
      logger.error('Network error:', error.message);
      throw new ApiError(`Network error: ${error.message}`, 0, error);
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
   * Get the full URL for an endpoint
   * @param {string} endpoint - API endpoint
   * @returns {string} - Full URL
   */
  getUrl(endpoint) {
    return `${this.baseUrl}${endpoint}`;
  }
}

/**
 * Convert object keys from camelCase to snake_case
 * @param {object} obj - Object to convert
 * @returns {object} - Object with snake_case keys
 */
export function objectToSnakeCase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(objectToSnakeCase);
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    converted[snakeKey] = typeof value === 'object' && value !== null ? 
      objectToSnakeCase(value) : value;
  }
  
  return converted;
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
