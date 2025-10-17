import { getAuthenticatedFetch } from '@/utils/authenticatedFetch';
import config from '@/app/config';

/**
 * Save a schema to the appropriate templates directory
 * @param {Object} schemaData - The schema JSON data
 * @param {string} schemaType - 'texture_schemas' or 'tree_schemas'
 * @param {string} gameVersion - 'fs25' or 'fs22'
 * @returns {Promise<Object>} - Success/error response with filename
 */
export async function saveSchemaToTemplates(schemaData, schemaType, gameVersion = 'fs25') {
  try {
    // Generate filename: game_type_timestamp.json
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0]; // 2025-10-17T21-00-00
    const typeShort = schemaType.replace('_schemas', ''); // 'texture' or 'tree'
    const filename = `${gameVersion}_${typeShort}_schema_${timestamp}.json`;
    
    // Determine directory path
    const dirPath = `${config.mfsTemplatesDir}/${gameVersion}/${schemaType}`;
    
    console.log(`Saving schema to: ${dirPath}/${filename}`);
    
    // Save the file
    const response = await getAuthenticatedFetch('/api/files/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        directory: dirPath,
        filename: filename,
        content: JSON.stringify(schemaData, null, 2)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      filename: filename,
      path: result.path || `${dirPath}/${filename}`,
      message: `Schema saved successfully as ${filename}`
    };
    
  } catch (error) {
    console.error('Failed to save schema:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to save schema: ${error.message}`
    };
  }
}

/**
 * Get available games for schema saving
 * @returns {Array} Array of game options
 */
export function getAvailableGamesForSchema(schemaType) {
  // Tree schemas are only available for FS25
  if (schemaType === 'tree_schemas') {
    return [{ value: 'fs25', label: 'FS25' }];
  }
  
  // Texture schemas are available for both
  return [
    { value: 'fs25', label: 'FS25' },
    { value: 'fs22', label: 'FS22' }
  ];
}