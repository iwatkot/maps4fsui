'use client';

import { useState, useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Custom hook for handling API calls with loading states and error handling
 * @param {Function} apiFunction - The API function to call
 * @returns {object} - Hook state and functions
 */
export function useApiCall(apiFunction) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      return result;
    } catch (err) {
      logger.error('API call failed:', err.message);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
}

/**
 * Hook for handling multiple API calls or batch operations
 */
export function useBatchApiCall() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [results, setResults] = useState([]);

  const executeBatch = useCallback(async (apiCalls) => {
    try {
      setLoading(true);
      setErrors([]);
      setResults([]);

      const promises = apiCalls.map(async (call, index) => {
        try {
          const result = await call();
          return { index, success: true, data: result };
        } catch (error) {
          logger.error(`Batch API call ${index} failed:`, error.message);
          return { index, success: false, error };
        }
      });

      const batchResults = await Promise.all(promises);
      
      const successResults = batchResults.filter(r => r.success).map(r => r.data);
      const errorResults = batchResults.filter(r => !r.success).map(r => r.error);

      setResults(successResults);
      setErrors(errorResults);

      return {
        results: successResults,
        errors: errorResults,
        hasErrors: errorResults.length > 0
      };
    } catch (err) {
      logger.error('Batch API execution failed:', err.message);
      setErrors([err]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setErrors([]);
    setResults([]);
  }, []);

  return {
    loading,
    errors,
    results,
    executeBatch,
    reset
  };
}
