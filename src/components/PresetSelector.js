'use client';

import { useState, useEffect } from 'react';
import config from '@/app/config';
import { getAuthenticatedFetch } from '@/utils/authenticatedFetch';

/**
 * PresetSelector - Compact dropdown for selecting presets
 */
export default function PresetSelector({ 
  type, 
  label, 
  icon, 
  onPresetSelect,
  disabled = false 
}) {
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load default from localStorage 
  useEffect(() => {
    if (disabled) {
      // Clear selection when disabled
      setSelectedPreset('');
      return;
    }
    
    const defaultPreset = localStorage.getItem(`defaultPreset_${type}`);
    if (defaultPreset) {
      setSelectedPreset(defaultPreset);
    }
  }, [type, disabled]);

  // Apply default preset when both presets are loaded and we have a selected preset
  useEffect(() => {
    if (!disabled && !loading && presets.length > 0 && selectedPreset && selectedPreset !== '') {
      // Check if this selectedPreset exists in the loaded presets
      const presetExists = presets.find(p => p.name === selectedPreset);
      if (presetExists) {
        console.log(`Auto-applying default ${type} preset:`, selectedPreset);
        handlePresetChange(selectedPreset);
      }
    }
  }, [presets, loading, selectedPreset, disabled, type]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load presets when component mounts or when opened
  useEffect(() => {
    loadPresets();
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPresets = async () => {
    setLoading(true);
    
    try {
      const sectionMap = {
        osm: 'mfsDefaultsOsmDir',
        dem: 'mfsDefaultsDemDir', 
        mainSettings: 'mfsDefaultsMSettingsDir',
        generationSettings: 'mfsDefaultsGSettingsDir'
      };

      const dirPath = config[sectionMap[type]];
      const extensions = getExtensions(type);
      
      const response = await getAuthenticatedFetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          directory: dirPath,
          extensions: extensions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setPresets(data.files || []);
    } catch (err) {
      console.error(`Failed to load ${type} presets:`, err);
      setPresets([]);
    } finally {
      setLoading(false);
    }
  };

  const getExtensions = (type) => {
    switch (type) {
      case 'osm': return ['.osm'];
      case 'dem': return ['.png'];
      case 'mainSettings':
      case 'generationSettings': return ['.json'];
      default: return [];
    }
  };

  const handlePresetChange = async (presetName) => {
    setSelectedPreset(presetName);
    setIsOpen(false);
    
    if (!presetName) {
      onPresetSelect?.(null);
      return;
    }

    // Find the preset file
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;

    try {
      if (type === 'mainSettings' || type === 'generationSettings') {
        // Load JSON content for settings presets
        const response = await getAuthenticatedFetch('/api/files/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: preset.path })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const content = await response.text();
        const jsonContent = JSON.parse(content);
        onPresetSelect?.(jsonContent);
      } else {
        // For OSM and DEM, just pass the file info
        onPresetSelect?.(preset);
      }
    } catch (err) {
      console.error('Failed to load preset content:', err);
      onPresetSelect?.(null);
    }
  };

  const getDefaultPreset = () => {
    return localStorage.getItem(`defaultPreset_${type}`);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>
      
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className={`w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm ${
            disabled 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">
              {loading ? 'Loading...' : 
               selectedPreset ? selectedPreset : 
               'Not set'}
            </span>
            <i className={`zmdi zmdi-chevron-${isOpen ? 'up' : 'down'} ml-2 text-gray-400`}></i>
          </div>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            {/* Clear selection option */}
            <button
              onClick={() => handlePresetChange('')}
              className="w-full px-3 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600"
            >
              <i className="zmdi zmdi-close mr-2"></i>
              No preset
            </button>
            
            {presets.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No presets available
              </div>
            ) : (
              presets.map((preset) => {
                const isDefault = preset.name === getDefaultPreset();
                return (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetChange(preset.name)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600 ${
                      preset.name === selectedPreset 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{preset.name}</span>
                      {isDefault && (
                        <i className="zmdi zmdi-star text-green-600 dark:text-green-400 ml-2"></i>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Click outside handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}