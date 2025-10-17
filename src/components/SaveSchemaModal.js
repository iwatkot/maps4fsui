'use client';

import { useState } from 'react';
import { saveSchemaToTemplates, getAvailableGamesForSchema } from '@/utils/schemaUtils';

/**
 * Modal for saving schemas to templates directory
 */
export default function SaveSchemaModal({ isOpen, onClose, schemaData, schemaType, onSaveSuccess }) {
  const [selectedGame, setSelectedGame] = useState('fs25');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const availableGames = getAvailableGamesForSchema(schemaType);
  
  const handleSave = async () => {
    if (!schemaData) {
      setError('No schema data to save');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await saveSchemaToTemplates(schemaData, schemaType, selectedGame);
      
      if (result.success) {
        if (onSaveSuccess) {
          onSaveSuccess(result);
        }
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Save {schemaType === 'tree_schemas' ? 'Tree' : 'Texture'} Schema
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className="zmdi zmdi-close text-xl"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Game Version
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableGames.map((game) => (
                <option key={game.value} value={game.value}>
                  {game.label}
                </option>
              ))}
            </select>
            {schemaType === 'tree_schemas' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tree schemas are only available for FS25
              </p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>File will be saved as:</strong>
              <br />
              <code className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                {selectedGame}_{schemaType.replace('_schemas', '')}_schema_{new Date().toISOString().replace(/[:.]/g, '-').split('.')[0]}.json
              </code>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <i className="zmdi zmdi-save mr-2"></i>
                  Save Schema
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}