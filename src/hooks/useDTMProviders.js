/**
 * Custom hook for managing DTM providers
 * Handles fetching providers based on coordinates and state management
 */

import { useState, useEffect } from 'react';
import { useApiCall } from './useApi';
import { getDTMProviders, parseCoordinates } from '../api/dtm';
import { defaultDTMOption } from '../config/formOptions';
import logger from '../utils/logger';

export const useDTMProviders = (coordinatesInput) => {
  const [dtmOptions, setDtmOptions] = useState([defaultDTMOption]);
  const [selectedDTMProvider, setSelectedDTMProvider] = useState(defaultDTMOption.value);
  
  // API hook for fetching DTM providers
  const { loading: dtmLoading, error: dtmError, execute: fetchDTMProviders } = useApiCall(getDTMProviders);

  // Effect to fetch DTM providers when coordinates change
  useEffect(() => {
    const coords = parseCoordinates(coordinatesInput);
    
    if (coords) {
      logger.info('Coordinates changed, fetching DTM providers for:', coords);
      
      fetchDTMProviders(coords.lat, coords.lon)
        .then((providers) => {
          // Convert providers object to options array
          const apiOptions = Object.entries(providers).map(([key, label]) => ({
            value: key,
            label: label,
            description: ''
          }));
          
          // Merge default option with API options, removing duplicates
          const mergedOptions = [defaultDTMOption];
          apiOptions.forEach(option => {
            if (option.value !== defaultDTMOption.value) {
              mergedOptions.push(option);
            }
          });
          
          setDtmOptions(mergedOptions);
          
          // Keep default selected if it was already selected
          if (!selectedDTMProvider || selectedDTMProvider === defaultDTMOption.value) {
            setSelectedDTMProvider(defaultDTMOption.value);
          }
          
          logger.info(`Set ${mergedOptions.length} DTM provider options`);
        })
        .catch((error) => {
          logger.error('Failed to fetch DTM providers:', error.message);
          // Keep default option even on error
          setDtmOptions([defaultDTMOption]);
          setSelectedDTMProvider(defaultDTMOption.value);
        });
    } else {
      // Keep default option even without coordinates
      setDtmOptions([defaultDTMOption]);
      setSelectedDTMProvider(defaultDTMOption.value);
    }
  }, [coordinatesInput, fetchDTMProviders]);

  return {
    dtmOptions,
    selectedDTMProvider,
    setSelectedDTMProvider,
    dtmLoading,
    dtmError
  };
};
