'use client';

import { useState, useEffect } from 'react';
import JSONEditorModal from '@/components/JSONEditorModal';
import config from '@/app/config';
import { getAuthenticatedFetch } from '@/utils/authenticatedFetch';
import apiService from '@/utils/apiService';

/**
 * ServerManagementSection - Component for managing server operations
 */
function ServerManagementSection({ showToast }) {
  const [isCleaningCache, setIsCleaningCache] = useState(false);
  const [isReloadingTemplates, setIsReloadingTemplates] = useState(false);
  const [isClearingLocalStorage, setIsClearingLocalStorage] = useState(false);

  const handleCleanCache = async () => {
    setIsCleaningCache(true);
    try {
      const result = await apiService.post('/server/clean_cache', {});
      showToast('Cache cleaned successfully', 'success');
    } catch (err) {
      console.error('Failed to clean cache:', err);
      showToast(`Failed to clean cache: ${err.message}`, 'error');
    } finally {
      setIsCleaningCache(false);
    }
  };

  const handleReloadTemplates = async () => {
    setIsReloadingTemplates(true);
    try {
      const result = await apiService.post('/server/reload_templates', {});
      showToast('Templates reloaded successfully', 'success');
    } catch (err) {
      console.error('Failed to reload templates:', err);
      showToast(`Failed to reload templates: ${err.message}`, 'error');
    } finally {
      setIsReloadingTemplates(false);
    }
  };

  const handleClearLocalStorage = async () => {
    setIsClearingLocalStorage(true);
    try {
      // Clear all localStorage items used by the application
      const keysToRemove = [
        // Promo and intro settings
        'maps4fs-promo-closed',
        'maps4fs-intro-closed',
        
        // Survey settings
        'maps4fs_survey_dismissed',
        'maps4fs_survey_completed',
        
        // Default presets
        'defaultPreset_mainSettings',
        'defaultPreset_generationSettings',
        'defaultPreset_osm',
        'defaultPreset_dem',
        
        // Default templates for FS25
        'defaultTemplate_fs25_texture_schemas',
        'defaultTemplate_fs25_tree_schemas',
        'defaultTemplate_fs25_buildings_schemas',
        'defaultTemplate_fs25_map_templates',
        
        // Default templates for FS22
        'defaultTemplate_fs22_texture_schemas',
        'defaultTemplate_fs22_map_templates'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Also clear any dynamic keys that might exist (in case there are other game versions)
      const allKeys = Object.keys(localStorage);
      const dynamicKeys = allKeys.filter(key => 
        key.startsWith('defaultTemplate_') || 
        key.startsWith('defaultPreset_') ||
        key.startsWith('maps4fs')
      );
      
      dynamicKeys.forEach(key => {
        if (!keysToRemove.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      showToast('Browser settings cleared successfully', 'success');
    } catch (err) {
      console.error('Failed to clear localStorage:', err);
      showToast(`Failed to clear browser settings: ${err.message}`, 'error');
    } finally {
      setIsClearingLocalStorage(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Server Operations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Clean Cache Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <i className="zmdi zmdi-delete text-red-600 dark:text-red-400 text-lg"></i>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Clean Cache</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remove cached data and temporary files</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
              Clears all cached data, temporary files, and processing artifacts. This can help resolve issues 
              with outdated data or free up disk space.
            </p>
            <button
              onClick={handleCleanCache}
              disabled={isCleaningCache}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center ${
                isCleaningCache
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isCleaningCache ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                  Cleaning...
                </>
              ) : (
                <>
                  <i className="zmdi zmdi-delete mr-2"></i>
                  Clean Cache
                </>
              )}
            </button>
          </div>

          {/* Reload Templates Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <i className="zmdi zmdi-refresh text-blue-600 dark:text-blue-400 text-lg"></i>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Reload Templates</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download and update default templates</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
              Downloads the latest default templates from the remote repository. This ensures you have 
              the most up-to-date schemas and configurations.
            </p>
            <button
              onClick={handleReloadTemplates}
              disabled={isReloadingTemplates}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center ${
                isReloadingTemplates
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isReloadingTemplates ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                  Reloading...
                </>
              ) : (
                <>
                  <i className="zmdi zmdi-refresh mr-2"></i>
                  Reload Templates
                </>
              )}
            </button>
          </div>

          {/* Clear Browser Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <i className="zmdi zmdi-storage text-orange-600 dark:text-orange-400 text-lg"></i>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Clear Browser Settings</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reset all local preferences and defaults</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
              Removes all stored preferences including default templates, presets, survey responses, 
              and other settings saved in your browser&apos;s local storage.
            </p>
            <button
              onClick={handleClearLocalStorage}
              disabled={isClearingLocalStorage}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center ${
                isClearingLocalStorage
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isClearingLocalStorage ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                  Clearing...
                </>
              ) : (
                <>
                  <i className="zmdi zmdi-storage mr-2"></i>
                  Clear Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SettingsTab - Tab for managing templates (texture schemas, tree schemas, map templates)
 * Only visible in public version
 */
export default function SettingsTab() {
  const [selectedGame, setSelectedGame] = useState('fs25');
  const [activeSection, setActiveSection] = useState('texture_schemas');
  const [files, setFiles] = useState({
    texture_schemas: [],
    tree_schemas: [],
    map_templates: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewType, setPreviewType] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [defaultTemplates, setDefaultTemplates] = useState({
    fs25: {
      texture_schemas: null,
      tree_schemas: null,
      buildings_schemas: null,
      map_templates: null
    },
    fs22: {
      texture_schemas: null,
      map_templates: null
    }
  });

  // Templates structure definition
  const TEMPLATES_STRUCTURE = {
    "general": [], // General settings - no game-specific sections
    "fs25": ["texture_schemas", "tree_schemas", "buildings_schemas", "map_templates"],
    "fs22": ["texture_schemas", "map_templates"],
  };

  // Load default templates from localStorage
  useEffect(() => {
    const savedDefaults = {
      fs25: {
        texture_schemas: localStorage.getItem('defaultTemplate_fs25_texture_schemas'),
        tree_schemas: localStorage.getItem('defaultTemplate_fs25_tree_schemas'),
        buildings_schemas: localStorage.getItem('defaultTemplate_fs25_buildings_schemas'),
        map_templates: localStorage.getItem('defaultTemplate_fs25_map_templates')
      },
      fs22: {
        texture_schemas: localStorage.getItem('defaultTemplate_fs22_texture_schemas'),
        map_templates: localStorage.getItem('defaultTemplate_fs22_map_templates')
      }
    };
    setDefaultTemplates(savedDefaults);
  }, []);

  // Game options (General last since it's used less)
  const gameOptions = [
    { id: 'fs25', label: 'Farming Simulator 25' },
    { id: 'fs22', label: 'Farming Simulator 22' },
    { id: 'general', label: 'General' }
  ];

  // Get sections for current game with smooth transitions
  const getGameSections = (game) => {
    return TEMPLATES_STRUCTURE[game] || [];
  };

  // Tab configuration based on selected game - memoized to prevent flickering
  const getSectionTabs = () => {
    // Handle General settings
    if (selectedGame === 'general') {
      return [{
        id: 'general_settings',
        label: 'Server Settings',
        icon: <i className="zmdi zmdi-settings"></i>,
        description: 'Server management and local preferences.',
        available: true
      }];
    }

    // Handle game-specific sections
    const sections = getGameSections(selectedGame);
    const sectionConfig = {
      texture_schemas: { 
        label: `Texture Schemas`, 
        icon: <i className="zmdi zmdi-image"></i>,
        description: 'JSON files that define texture mapping and materials for terrain generation.',
        available: true // Always available
      },
      tree_schemas: { 
        label: `Tree Schemas`, 
        icon: <i className="zmdi zmdi-nature"></i>,
        description: 'JSON files that define tree placement patterns and species for forest generation. (FS25 only)',
        available: selectedGame === 'fs25' // Only for FS25
      },
      buildings_schemas: { 
        label: `Buildings Schemas`, 
        icon: <i className="zmdi zmdi-home"></i>,
        description: 'JSON files that define building placement patterns and types for settlement generation. (FS25 only)',
        available: selectedGame === 'fs25' // Only for FS25
      },
      map_templates: { 
        label: `Map Templates`, 
        icon: <i className="zmdi zmdi-file-text"></i>,
        description: 'ZIP files containing pre-configured map templates with specific layouts and settings.',
        available: true // Always available
      }
    };

    // Return all sections but mark availability
    return Object.keys(sectionConfig).map(sectionId => ({
      id: sectionId,
      ...sectionConfig[sectionId]
    }));
  };

  // Initial background load when component mounts
  useEffect(() => {
    if (selectedGame !== 'general') {
      loadAllFilesBackground();
    }
  }, []); // Only run once on mount

  // Load files for all sections when game changes
  useEffect(() => {
    
    // Always set loading to false immediately for instant UI response
    setLoading(false);
    
    if (selectedGame !== 'general') {
      // Load files in background without showing loading state
      loadAllFilesBackground();
    } else {
      // For general, just clear files
      setFiles({
        general_settings: []
      });
    }
  }, [selectedGame]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllFilesBackground = async () => {
    setError(null);
    
    try {
      const sections = getGameSections(selectedGame);
      const promises = sections.map(section => loadSectionFiles(section));
      const results = await Promise.allSettled(promises);

      const newFiles = {};
      sections.forEach((section, index) => {
        newFiles[section] = results[index].status === 'fulfilled' ? results[index].value : [];
      });

      setFiles(newFiles);
      
      // Log any errors but don't fail completely
      const errors = results.filter(r => r.status === 'rejected').map(r => r.reason);
      if (errors.length > 0) {
        console.warn('Some sections failed to load (this is normal if directories don\'t exist yet):', errors);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Don't set error state - just show empty interface
      console.warn('Templates directory may not exist yet, showing empty interface');
    }
  };

  // Set first available section when game changes
  useEffect(() => {
    const getGameSections = (game) => {
      return TEMPLATES_STRUCTURE[game] || [];
    };
    
    if (selectedGame === 'general') {
      setActiveSection('general_settings');
    } else {
      const availableSections = getGameSections(selectedGame);
      // If current section is not available for this game, switch to first available
      if (availableSections.length > 0 && !availableSections.includes(activeSection)) {
        setActiveSection(availableSections[0]);
      }
    }
  }, [selectedGame, activeSection]);

  const loadAllFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sections = getGameSections(selectedGame);
      const promises = sections.map(section => loadSectionFiles(section));
      const results = await Promise.allSettled(promises);

      const newFiles = {};
      sections.forEach((section, index) => {
        newFiles[section] = results[index].status === 'fulfilled' ? results[index].value : [];
      });

      setFiles(newFiles);
      
      // Log any errors but don't fail completely
      const errors = results.filter(r => r.status === 'rejected').map(r => r.reason);
      if (errors.length > 0) {
        console.warn('Some sections failed to load (this is normal if directories don\'t exist yet):', errors);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Don't set error state - just show empty interface
      console.warn('Templates directory may not exist yet, showing empty interface');
    } finally {
      setLoading(false);
    }
  };

  const loadSectionFiles = async (section) => {
    const dirPath = `${config.mfsTemplatesDir}/${selectedGame}/${section}`;
    
    try {
      const response = await getAuthenticatedFetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          directory: dirPath,
          extensions: getExtensions(section)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (err) {
      console.error(`Failed to load ${section} files:`, err);
      return [];
    }
  };

  const getExtensions = (section) => {
    switch (section) {
      case 'texture_schemas':
      case 'tree_schemas':
      case 'buildings_schemas': 
        return ['.json'];
      case 'map_templates': 
        return ['.zip'];
      default: 
        return [];
    }
  };

  const getCurrentSectionDescription = () => {
    const tabs = getSectionTabs();
    const currentTab = tabs.find(tab => tab.id === activeSection);
    return currentTab ? currentTab.description : '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    const mb = bytes / (1024 * 1024);
    
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    } else {
      return `${kb.toFixed(1)} KB`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handlePreview = async (file) => {
    setSelectedFile(file);
    
    try {
      if (file.name.endsWith('.json')) {
        // Load JSON content
        const response = await getAuthenticatedFetch('/api/files/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: file.path })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const content = await response.text();
        const jsonContent = JSON.parse(content);
        setPreviewData(jsonContent);
        setPreviewType('json');
      } else if (file.name.endsWith('.zip')) {
        // For ZIP files, show basic info
        setPreviewData({
          filename: file.name,
          size: file.size,
          type: 'Map Template (ZIP Archive)',
          message: 'ZIP files cannot be previewed. This file contains a complete map template.'
        });
        setPreviewType('zip');
      }
      
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Failed to load file content:', err);
      showToast('Failed to load file content', 'error');
    }
  };

  const handleRename = async (file, newName) => {
    try {
      const response = await getAuthenticatedFetch('/api/files/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPath: file.path,
          newName: newName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      showToast('File renamed successfully');
      loadAllFiles(); // Reload files
    } catch (err) {
      console.error('Failed to rename file:', err);
      showToast('Failed to rename file', 'error');
    }
  };

  const handleSetAsDefault = (file) => {
    const key = `defaultTemplate_${selectedGame}_${activeSection}`;
    localStorage.setItem(key, file.name);
    setDefaultTemplates(prev => ({
      ...prev,
      [selectedGame]: {
        ...prev[selectedGame],
        [activeSection]: file.name
      }
    }));
    
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('defaultTemplateChanged'));
    
    showToast(`Set "${file.name}" as default ${activeSection.replace('_', ' ')} template for ${selectedGame.toUpperCase()}`);
  };

  const handleRemoveDefault = () => {
    const key = `defaultTemplate_${selectedGame}_${activeSection}`;
    localStorage.removeItem(key);
    setDefaultTemplates(prev => ({
      ...prev,
      [selectedGame]: {
        ...prev[selectedGame],
        [activeSection]: null
      }
    }));
    
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('defaultTemplateChanged'));
    
    showToast(`Removed default ${activeSection.replace('_', ' ')} template for ${selectedGame.toUpperCase()}`);
  };

  const handleDelete = (file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      const response = await getAuthenticatedFetch('/api/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: fileToDelete.path })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      showToast('File deleted successfully');
      loadAllFiles(); // Reload files
    } catch (err) {
      console.error('Failed to delete file:', err);
      showToast('Failed to delete file', 'error');
    } finally {
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFileToDelete(null);
  };

  const renderPreviewModal = () => {
    if (!showPreviewModal || !previewData || !selectedFile) return null;

    if (previewType === 'json') {
      return (
        <JSONEditorModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          jsonData={previewData}
          title={`Preview: ${selectedFile.name}`}
          hideSaveButton={true}
        />
      );
    } else if (previewType === 'zip') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Preview: {selectedFile.name}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="zmdi zmdi-close text-xl"></i>
              </button>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p><strong>Type:</strong> {previewData.type}</p>
                <p><strong>Size:</strong> {formatFileSize(previewData.size)}</p>
                <p className="text-sm">{previewData.message}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderFileTable = (sectionFiles) => {
    if (sectionFiles.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">📁</div>
          <div className="text-lg font-medium mb-2">No Templates Found</div>
          <div className="text-sm max-w-md mx-auto">
            No {activeSection.replace('_', ' ')} templates found for {selectedGame.toUpperCase()}.
            <br />
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">
              Expected directory: templates/{selectedGame}/{activeSection}
            </span>
          </div>
        </div>
      );
    }

    // Sort files to show default first
    const defaultTemplate = defaultTemplates[selectedGame]?.[activeSection];
    const sortedFiles = [...sectionFiles].sort((a, b) => {
      if (a.name === defaultTemplate) return -1;
      if (b.name === defaultTemplate) return 1;
      return 0;
    });

    return (
      <div className="space-y-4">
        {/* Default Template Info */}
        {defaultTemplate && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="zmdi zmdi-star text-green-600 dark:text-green-400 mr-2"></i>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Default {activeSection.replace('_', ' ')}: {defaultTemplate}
                </span>
              </div>
              <button
                onClick={handleRemoveDefault}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 text-xs rounded transition-colors"
              >
                Remove Default
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedFiles.map((file, index) => (
                <FileRow
                  key={`${file.path}-${index}`}
                  file={file}
                  isDefault={file.name === defaultTemplate}
                  onPreview={handlePreview}
                  onRename={handleRename}
                  onSetAsDefault={handleSetAsDefault}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <i className="zmdi zmdi-alert-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadAllFiles}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sectionTabs = getSectionTabs();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Game Selection */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Game Version:</span>
            <div className="flex space-x-2">
              {gameOptions.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center ${
                    selectedGame === game.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {game.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {sectionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.available && setActiveSection(tab.id)}
                disabled={!tab.available}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  !tab.available
                    ? 'border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
                    : activeSection === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
                title={!tab.available ? `Only available for ${selectedGame === 'fs25' ? 'FS25' : 'FS22'}` : ''}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
                {!tab.available && <span className="ml-1 text-xs">(N/A)</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {sectionTabs.find(t => t.id === activeSection)?.label}
            </h2>
            <div className="text-gray-600 dark:text-gray-400">
              {getCurrentSectionDescription()}
            </div>
          </div>

          {/* Handle General settings */}
          {selectedGame === 'general' && activeSection === 'general_settings' ? (
            <ServerManagementSection showToast={showToast} />
          
          ) : (
            /* Check if current section is available for selected game */
            sectionTabs.find(t => t.id === activeSection)?.available ? (
              renderFileTable(files[activeSection] || [])
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">🚫</div>
                <div className="text-lg font-medium mb-2">Section Not Available</div>
                <div className="text-sm max-w-md mx-auto">
                  {sectionTabs.find(t => t.id === activeSection)?.label} is not available for {selectedGame.toUpperCase()}.
                  <br />
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">
                    Switch to an available section or select a different game version.
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {renderPreviewModal()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <i className="zmdi zmdi-alert-triangle text-red-600 dark:text-red-400 text-xl"></i>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Delete File
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold">&quot;{fileToDelete.name}&quot;</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * FileRow component for displaying individual file information
 */
function FileRow({ file, isDefault, onPreview, onRename, onSetAsDefault, onDelete }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (newName.trim() && newName !== file.name) {
      await onRename(file, newName.trim());
    }
    setIsRenaming(false);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    const mb = bytes / (1024 * 1024);
    
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    } else {
      return `${kb.toFixed(1)} KB`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isDefault ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              autoFocus
            />
            <button
              type="submit"
              className="text-green-600 hover:text-green-700"
              title="Save"
            >
              <i className="zmdi zmdi-check"></i>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRenaming(false);
                setNewName(file.name);
              }}
              className="text-gray-600 hover:text-gray-700"
              title="Cancel"
            >
              <i className="zmdi zmdi-close"></i>
            </button>
          </form>
        ) : (
          <div className="flex items-center">
            {isDefault && <i className="zmdi zmdi-star text-green-600 dark:text-green-400 mr-2"></i>}
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {file.name}
            </div>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatFileSize(file.size)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(file.created)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(file.modified)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        <div className="flex space-x-2">
          <button
            onClick={() => onPreview(file)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Preview"
          >
            <i className="zmdi zmdi-eye"></i>
          </button>
          <button
            onClick={() => {
              setNewName(file.name);
              setIsRenaming(true);
            }}
            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
            title="Rename"
          >
            <i className="zmdi zmdi-edit"></i>
          </button>
          <button
            onClick={() => onSetAsDefault(file)}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title="Set as Default"
          >
            <i className="zmdi zmdi-star"></i>
          </button>
          <button
            onClick={() => onDelete(file)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <i className="zmdi zmdi-delete"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}