import { constraints } from '@/config/validation';
import { isDTMCodeValid } from '@/api/dtm';

/**
 * Convert camelCase string to snake_case
 * @param {string} str - Input string in camelCase
 * @returns {string} - Converted string in snake_case
 * 
 * Example:
 *
 *  const camelString = "addFoundations";
 *  const snakeString = toSnakeCase(camelString);
 *  console.log(snakeString); // "add_foundations"
 */
const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
};


/**
 * Convert object keys from camelCase to snake_case
 * @param {Object} obj - Input object with camelCase keys
 * @param {boolean} [skipFalsy=true] - Whether to skip falsy values
 * @returns {Object} - New object with snake_case keys
 *
 * Example:
 *
 *   const input = { addFoundations: true, someValue: null };
 *
 *   const output = objectToSnakeCase(input);
 *   console.log(output); // { add_foundations: true } // Falsy values are skipped.
 */
const objectToSnakeCase = (obj, skipFalsy = true) => {
  const newObj = {};
  for (const key in obj) {
    const snakeKey = toSnakeCase(key);
    const value = obj[key];

    if (skipFalsy && !value) {
      continue;
    }

    newObj[snakeKey] = value;
  }
  return newObj;
};


/**
 * Preprocess settings object by converting nested keys to snake_case
 * @param {Object} settings - Input settings object
 * @returns {Object} - New object with snake_case keys
 *
 * Example:
 *
 *   const input = {
 *       DEMSettings: {
 *           addFoundations: true,
 *           someValue: null
 *       },
 *       BackgroundSettings: {
 *           addFoundations: true,
 *           someValue: null
 *       }
 *   };
 *
 *   const output = preprocessSettings(input);
 *   console.log(output);
 *
 *   Output:
 *   {
 *       DEMSettings: {
 *           add_foundations: true
 *       },
 *       BackgroundSettings: {
 *           add_foundations: true
 *        }
 *   }
 */
export const preprocessSettings = (settings) => {
  const preprocessedSettings = {}
  for (const key in settings) {
    const value = settings[key];
    // Do not change the root level keys, process only nested objects.
    // Check if the value is an object, skip otherwise.
    if (typeof value === "object" && value !== null) {
      preprocessedSettings[key] = objectToSnakeCase(value);
    }
  }
  return preprocessedSettings;
};

/**
 * Validate coordinate string input
 * @param {string} value - Coordinate string (e.g., "lat, lon")
 * @returns {boolean} - Whether the coordinates are valid
 */
export const validateCoordinates = (value) => {
  // Remove extra whitespace and split by comma or whitespace
  const trimmed = value.trim();
  if (!trimmed) return false;
  
  // Split by comma or whitespace (or both)
  const parts = trimmed.split(/[,\s]+/).filter(part => part.length > 0);
  
  // Must have exactly 2 parts
  if (parts.length !== 2) return false;
  
  // Both parts must be valid floats
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  // Check if parsing was successful (not NaN) and values are reasonable coordinates
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= constraints.coordinates.minLat && lat <= constraints.coordinates.maxLat &&
         lng >= constraints.coordinates.minLng && lng <= constraints.coordinates.maxLng;
};

/**
 * Parse coordinate string into lat/lon object
 * @param {string} value - Coordinate string (e.g., "lat, lon")
 * @returns {object|null} - {lat, lon} object or null if invalid
 */
export const parseCoordinates = (value) => {
  if (!validateCoordinates(value)) return null;
  
  const trimmed = value.trim();
  const parts = trimmed.split(/[,\s]+/).filter(part => part.length > 0);
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  
  return { lat, lon };
};


/**
 * Validate game code
 * @param {string} gameCode - Game code (e.g., "fs22")
 * @returns {boolean} - Whether the game code is valid
 */
const validateGameCode = (gameCode) => {
  const validGameCodes = ['fs22', 'fs25'];
  return validGameCodes.includes(gameCode);
};


/**
 * Validate rotation
 * @param {number} rotation - Rotation value
 * @returns {boolean} - Whether the rotation is valid
 */
const validateRotation = (rotation) => {
  return rotation >= constraints.rotation.min && rotation <= constraints.rotation.max;
};

/**
 * Preprocess main settings
 * @param {object} data - Main settings data
 * @returns {object} - Preprocessed main settings
 */
export const preprocessMainSettings = (data) => {
  const preprocessedMainSettings = {}

  if (!validateGameCode(data.gameCode)) {
    throw new Error(`Invalid game code: ${data.gameCode}`);
  }
  preprocessedMainSettings.gameCode = data.gameCode;

  if (!validateCoordinates(data.coordinates)) {
    throw new Error(`Invalid coordinates: ${data.coordinates}`);
  }
  // Unpack lat/lon from coordinates for easier requests to API.
  const { lat, lon } = parseCoordinates(data.coordinates);
  preprocessedMainSettings.lat = lat;
  preprocessedMainSettings.lon = lon;

  const customSize = data.customSize || null;
  const size = customSize || data.size;
  preprocessedMainSettings.size = size;
  
  // Handle outputSize: if missing/null OR equals size, set to null.
  const outputSize = (!data.outputSize || data.outputSize === size) ? null : data.outputSize;
  // Do not add outputSize if null.
  if (outputSize) {
    preprocessedMainSettings.outputSize = outputSize;
  }

  if (!validateRotation(data.rotation)) {
    throw new Error(`Invalid rotation: ${data.rotation}`);
  }
  preprocessedMainSettings.rotation = data.rotation;

  if (!isDTMCodeValid(data.dtmCode)) {
    throw new Error(`Invalid DTM code: ${data.dtmCode}`);
  }
  preprocessedMainSettings.dtmCode = data.dtmCode;

  return preprocessedMainSettings;
}
