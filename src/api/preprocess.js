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
const preprocessSettings = (settings) => {
  for (const key in settings) {
    const value = settings[key];
    // Do not change the root level keys, process only nested objects.
    // Check if the value is an object, skip otherwise.
    if (typeof value === "object" && value !== null) {
      settings[key] = objectToSnakeCase(value);
    }
  }
  return settings;
};

export default preprocessSettings;
