/**
 * Custom hook for managing DTM providers and their settings
 * Handles fetching providers based on coordinates and provider info for settings
 */

import { useState, useEffect } from 'react';
import { useApiCall } from './useApi';
import { getDTMProviders, getDTMProviderInfo } from '@/api/dtm';
import { parseCoordinates } from '@/api/preprocess';
import { defaultDTMOption } from '../config/validation';
import logger from '../utils/logger';

export const useDTMProviders = (coordinatesInput) => {
  const [dtmOptions, setDtmOptions] = useState([defaultDTMOption]);
  const [selectedDTMProvider, setSelectedDTMProvider] = useState(defaultDTMOption.value);
  const [providerInfo, setProviderInfo] = useState(null);
  const [dtmSettings, setDtmSettings] = useState({});
  
  // API hooks for fetching DTM providers and provider info
  const { loading: dtmLoading, error: dtmError, execute: fetchDTMProviders } = useApiCall(getDTMProviders);
  const { loading: providerInfoLoading, error: providerInfoError, execute: fetchProviderInfo } = useApiCall(getDTMProviderInfo);

  // Effect to fetch DTM providers when coordinates change
  useEffect(() => {
    const coords = parseCoordinates(coordinatesInput);
    
    if (coords) {
      // logger.info('Coordinates changed, fetching DTM providers for:', coords);
      
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
          
          // logger.info(`Set ${mergedOptions.length} DTM provider options`);
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
  }, [coordinatesInput, fetchDTMProviders, selectedDTMProvider]);

  // Effect to fetch provider info when selected DTM provider changes
  useEffect(() => {
    if (selectedDTMProvider && selectedDTMProvider !== defaultDTMOption.value) {
      // logger.info('Selected DTM provider changed, fetching provider info for:', selectedDTMProvider);
      
      fetchProviderInfo(selectedDTMProvider)
        .then((info) => {
          // logger.info('DTM provider info fetched:', info);
          setProviderInfo(info);
          
          // Initialize DTM settings with default values when provider changes
          if (info && info.settings_required && info.settings) {
            const defaultSettings = {};
            
            Object.entries(info.settings).forEach(([key, setting]) => {
              if (typeof setting === 'string') {
                // String type - use empty string as default
                defaultSettings[key] = '';
              } else if (typeof setting === 'object' && Array.isArray(setting)) {
                // Array/tuple type - use first item as default
                defaultSettings[key] = setting[0] || '';
              } else if (typeof setting === 'object') {
                // Dict type - use first key as default
                const keys = Object.keys(setting);
                defaultSettings[key] = keys[0] || '';
              }
            });
            
            // logger.info('Initializing DTM settings with defaults:', defaultSettings);
            setDtmSettings(defaultSettings);
          } else {
            setDtmSettings({});
          }
        })
        .catch((error) => {
          logger.error('Failed to fetch DTM provider info:', error.message);
          setProviderInfo(null);
          setDtmSettings({});
        });
    } else {
      // Clear provider info for default option
      setProviderInfo(null);
      setDtmSettings({});
    }
  }, [selectedDTMProvider, fetchProviderInfo]);

  return {
    dtmOptions,
    selectedDTMProvider,
    setSelectedDTMProvider,
    dtmLoading: dtmLoading || providerInfoLoading,
    dtmError: dtmError || providerInfoError,
    providerInfo,
    dtmSettings,
    setDtmSettings
  };
};
