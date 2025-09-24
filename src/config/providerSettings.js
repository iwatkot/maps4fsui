// Provider-specific settings configuration
// This file centralizes all provider-specific overrides for various settings

/**
 * Configuration for provider-specific setting overrides
 * Structure: {
 *   [providerCode]: {
 *     [settingCategory]: {
 *       [settingName]: value
 *     }
 *   }
 * }
 */
export const providerSpecificSettings = {
  'srtm30': {
    dem: {
      blurRadius: 35  // Override default blur radius of 3 for SRTM30 provider
    }
  }
  // Add more providers and their specific settings here as needed
  // Example:
  // 'other-provider': {
  //   dem: {
  //     waterDepth: 5
  //   },
  //   background: {
  //     someOtherSetting: 'value'
  //   }
  // }
};

/**
 * Get provider-specific override for a setting
 * @param {string} providerCode - The DTM provider code
 * @param {string} category - Setting category (e.g., 'dem', 'background')
 * @param {string} settingName - The setting name
 * @param {any} defaultValue - The default value to use if no override exists
 * @returns {any} The override value or default value
 */
export function getProviderSetting(providerCode, category, settingName, defaultValue) {
  const providerConfig = providerSpecificSettings[providerCode];
  if (!providerConfig) {
    return defaultValue;
  }
  
  const categoryConfig = providerConfig[category];
  if (!categoryConfig) {
    return defaultValue;
  }
  
  return categoryConfig.hasOwnProperty(settingName) 
    ? categoryConfig[settingName] 
    : defaultValue;
}

/**
 * Check if a provider has any specific overrides for a category
 * @param {string} providerCode - The DTM provider code
 * @param {string} category - Setting category (e.g., 'dem', 'background')
 * @returns {boolean} True if provider has overrides for this category
 */
export function hasProviderOverrides(providerCode, category) {
  const providerConfig = providerSpecificSettings[providerCode];
  return !!(providerConfig && providerConfig[category]);
}

/**
 * Get all provider overrides for a category
 * @param {string} providerCode - The DTM provider code
 * @param {string} category - Setting category (e.g., 'dem', 'background')
 * @returns {object} Object with all overrides or empty object
 */
export function getProviderCategoryOverrides(providerCode, category) {
  const providerConfig = providerSpecificSettings[providerCode];
  if (!providerConfig || !providerConfig[category]) {
    return {};
  }
  
  return { ...providerConfig[category] };
}