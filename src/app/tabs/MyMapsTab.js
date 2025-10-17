'use client';

import { useState, useEffect, useMemo } from 'react';
import MixedPreviewGallery from '@/components/MixedPreviewGallery';
import SlideNavigator from '@/components/SlideNavigator';
import JSONEditorModal from '@/components/JSONEditorModal';
import { separateFilesByType } from '@/utils/fileTypeUtils';

// Helper function to format coordinates for display
const formatCoordinates = (coordinates) => {
  if (!coordinates) return '';
  
  // Try to parse and format coordinates with fewer decimal places
  try {
    // Handle different coordinate formats
    if (coordinates.includes(',')) {
      const [lat, lon] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
      return `${lat.toFixed(8)}, ${lon.toFixed(8)}`;
    }
    return coordinates;
  } catch {
    return coordinates;
  }
};

export default function MyMapsTab({ onDuplicateMap }) {
  const [selectedMap, setSelectedMap] = useState(null);
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewPage, setPreviewPage] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [showJSONModal, setShowJSONModal] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [jsonType, setJsonType] = useState('');
  const [mapSchemaPaths, setMapSchemaPaths] = useState({ texture: null, tree: null });
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState({
    completed: true,
    incomplete: true,
    error: false // Default off for error maps as requested
  });
  const [assetFilters, setAssetFilters] = useState({
    background: false,
    water: false,
    flattenedRoads: false,
    forests: false,
    dissolved: false,
    satelliteImages: false
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const mapsPerPage = 10;

  // Fetch maps from API
  const fetchMaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/maps');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch maps');
      }
      
      setMaps(data.maps || []);
    } catch (err) {
      console.error('Error fetching maps:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('status-dropdown');
      if (dropdown && !dropdown.contains(event.target) && !event.target.closest('button[data-dropdown-toggle]')) {
        dropdown.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Filter and search maps
  const filteredMaps = useMemo(() => {
    let filtered = maps;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(map => {
        // Search by name
        if (map.name.toLowerCase().includes(query)) return true;
        
        // Search by coordinates (support both comma-separated and space-separated)
        const coords = formatCoordinates(map.coordinates).toLowerCase();
        if (coords.includes(query)) return true;
        
        // Try to match individual coordinate numbers
        const coordNumbers = coords.match(/[-]?\d+\.?\d*/g) || [];
        return coordNumbers.some(num => num.includes(query));
      });
    }

    // Apply status filters (OR logic)
    const activeStatusFilters = Object.entries(statusFilters)
      .filter(([_, enabled]) => enabled)
      .map(([status, _]) => status);
    
    if (activeStatusFilters.length > 0) {
      filtered = filtered.filter(map => activeStatusFilters.includes(map.status));
    }

    // Apply asset filters (AND logic)
    const activeAssetFilters = Object.entries(assetFilters)
      .filter(([_, enabled]) => enabled)
      .map(([asset, _]) => asset);
    
    if (activeAssetFilters.length > 0) {
      filtered = filtered.filter(map => {
        return activeAssetFilters.every(asset => {
          switch (asset) {
            case 'background':
              return map.generationSettings?.BackgroundSettings?.generate_background;
            case 'water':
              return map.generationSettings?.BackgroundSettings?.generate_water;
            case 'flattenedRoads':
              return map.generationSettings?.BackgroundSettings?.flatten_roads;
            case 'forests':
              return map.generationSettings?.I3DSettings?.add_trees;
            case 'dissolved':
              return map.generationSettings?.TextureSettings?.dissolve;
            case 'satelliteImages':
              return map.generationSettings?.SatelliteSettings?.download_images;
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  }, [maps, searchQuery, statusFilters, assetFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMaps.length / mapsPerPage);
  const startIndex = (currentPage - 1) * mapsPerPage;
  const paginatedMaps = filteredMaps.slice(startIndex, startIndex + mapsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilters, assetFilters]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'generating': return 'text-blue-600 dark:text-blue-400';
      case 'incomplete': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <i className="zmdi zmdi-check-circle"></i>;
      case 'generating': return <i className="zmdi zmdi-refresh zmdi-hc-spin"></i>;
      case 'incomplete': return <i className="zmdi zmdi-pause-circle"></i>;
      case 'error': return <i className="zmdi zmdi-close-circle"></i>;
      default: return <i className="zmdi zmdi-help-outline"></i>;
    }
  };

  const handleMapSelect = (map) => {
    setSelectedMap(map);
    setPreviewPage(0); // Reset preview page when switching maps
    setEditingName(false); // Reset editing state
    setEditedName('');
    // Fetch schema file availability for this map
    fetchSchemaFiles(map.id);
  };

  const fetchSchemaFiles = async (mapId) => {
    try {
      const res = await fetch(`/api/maps/schema-files?mapId=${encodeURIComponent(mapId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setMapSchemaPaths({ texture: data.texture, tree: data.tree });
    } catch (err) {
      console.error('Error fetching schema files:', err);
    }
  };

  // Handle name editing
  const handleNameEdit = () => {
    setEditingName(true);
    setEditedName(selectedMap.name);
  };

  const handleNameSave = async () => {
    if (!editedName.trim() || editedName === selectedMap.name) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      const response = await fetch('/api/maps/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId: selectedMap.id,
          newName: editedName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename map');
      }

      // Update the selected map and maps list
      const updatedMap = { ...selectedMap, name: editedName.trim() };
      setSelectedMap(updatedMap);
      setMaps(prevMaps => 
        prevMaps.map(map => 
          map.id === selectedMap.id ? updatedMap : map
        )
      );
      setEditingName(false);
    } catch (err) {
      console.error('Error renaming map:', err);
      alert('Failed to rename map. Please try again.');
    } finally {
      setSavingName(false);
    }
  };

  const handleNameCancel = () => {
    setEditingName(false);
    setEditedName(selectedMap.name);
  };

  const handleNameBlur = () => {
    if (editedName.trim() && editedName !== selectedMap.name) {
      handleNameSave();
    } else {
      handleNameCancel();
    }
  };

  // Handle JSON modal
  const handleShowJSON = (type) => {
    if (type === 'generation_settings') {
      setJsonData(selectedMap.generationSettings);
      setJsonType('Generation Settings');
    } else if (type === 'generation_info') {
      setJsonData(selectedMap.generationInfo);
      setJsonType('Generation Info');
    } else if (type === 'main_settings') {
      setJsonData(selectedMap.mainSettings);
      setJsonType('Main Settings');
    }
    setShowJSONModal(true);
  };

  // Handle saving settings to presets
  const handleSaveToPresets = async (type, data, mapName) => {
    if (!data || !mapName) return;
    
    try {
      const response = await fetch('/api/presets/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type,
          data: data,
          filename: `${mapName.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save to presets');
      }

      showToast(`${type === 'mainSettings' ? 'Main Settings' : 'Generation Settings'} saved to presets successfully!`, 'success');
    } catch (error) {
      console.error('Error saving to presets:', error);
      showToast(`Failed to save to presets: ${error.message}`, 'error');
    }
  };

  // Handle saving custom OSM to presets
  const handleSaveCustomOsm = async (mapId, mapName) => {
    if (!mapId || !mapName) return;
    
    try {
      const response = await fetch('/api/presets/save-osm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId: mapId,
          filename: `${mapName.replace(/[^a-zA-Z0-9_-]/g, '_')}.osm`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save OSM to presets');
      }

      showToast('Custom OSM saved to presets successfully!', 'success');
    } catch (error) {
      console.error('Error saving OSM to presets:', error);
      showToast(`Failed to save OSM to presets: ${error.message}`, 'error');
    }
  };

  // Handle saving custom DEM to presets
  const handleSaveCustomDem = async (mapId, mapName) => {
    if (!mapId || !mapName) return;
    
    try {
      const response = await fetch('/api/presets/save-dem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId: mapId,
          filename: `${mapName.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save DEM to presets');
      }

      showToast('Custom DEM saved to presets successfully!', 'success');
    } catch (error) {
      console.error('Error saving DEM to presets:', error);
      showToast(`Failed to save DEM to presets: ${error.message}`, 'error');
    }
  };

  // Handle map deletion
  const handleDeleteMap = () => {
    if (!selectedMap || deleting) return;
    setShowDeleteModal(true);
  };

  // Confirm and perform deletion
  const confirmDeleteMap = async () => {
    if (!selectedMap || deleting) return;
    
    try {
      setDeleting(true);
      setShowDeleteModal(false);
      
      const response = await fetch(`/api/maps/delete?mapId=${selectedMap.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete map');
      }
      
      // Show success message
      showToast('Map deleted successfully!', 'success');
      
      // Refresh the maps list and clear selection
      await fetchMaps();
      setSelectedMap(null);
      
    } catch (error) {
      console.error('Error deleting map:', error);
      showToast(`Failed to delete map: ${error.message}`, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Handle map download
  const handleDownloadMap = async () => {
    if (!selectedMap || downloading) return;
    
    try {
      setDownloading(true);
      showToast('Preparing download...', 'info');
      
      const response = await fetch(`/api/maps/download?mapId=${selectedMap.id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download map');
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedMap.id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('Download started successfully!', 'success');
      
    } catch (error) {
      console.error('Error downloading map:', error);
      showToast(`Failed to download map: ${error.message}`, 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Handle map retry (same as duplicate but for failed maps)
  const handleRetryMapClick = async () => {
    if (!selectedMap || !onDuplicateMap) return;
    
    try {
      showToast('Preparing map retry...', 'info');
      
      // Check for custom OSM file
      const osmResponse = await fetch(`/api/maps/osm?mapId=${selectedMap.id}`);
      const osmData = await osmResponse.json();
      
      // Prepare duplication data
      const duplicateData = {
        mainSettings: selectedMap.mainSettings,
        generationSettings: selectedMap.generationSettings,
        customOsm: osmData.hasCustomOsm ? {
          content: osmData.osmContent,
          fileName: osmData.fileName
        } : null
      };
      
      // Wait 1.5 seconds so user can read the toast, then switch tabs
      setTimeout(() => {
        onDuplicateMap(duplicateData);
        showToast('Map settings loaded in Generator for retry!', 'success');
      }, 1500);
      
    } catch (error) {
      console.error('Error retrying map:', error);
      showToast(`Failed to retry map: ${error.message}`, 'error');
    }
  };

  // Handle map duplication
  const handleDuplicateMapClick = async () => {
    if (!selectedMap || !onDuplicateMap) return;
    
    try {
      showToast('Preparing map duplication...', 'info');
      
      // Check for custom OSM file
      const osmResponse = await fetch(`/api/maps/osm?mapId=${selectedMap.id}`);
      const osmData = await osmResponse.json();
      
      // Prepare duplication data
      const duplicateData = {
        mainSettings: selectedMap.mainSettings,
        generationSettings: selectedMap.generationSettings,
        customOsm: osmData.hasCustomOsm ? {
          content: osmData.osmContent,
          fileName: osmData.fileName
        } : null
      };
      
      // Wait 1.5 seconds so user can read the toast, then switch tabs
      setTimeout(() => {
        onDuplicateMap(duplicateData);
        showToast('Map settings loaded in Generator!', 'success');
      }, 1500);
      
    } catch (error) {
      console.error('Error duplicating map:', error);
      showToast(`Failed to duplicate map: ${error.message}`, 'error');
    }
  };

  // Calculate total pages for preview navigation
  const totalPreviewPages = useMemo(() => {
    if (!selectedMap?.previews || selectedMap.previews.length === 0) return 0;
    
    const { pngPreviews, stlModels } = separateFilesByType(selectedMap.previews);
    const hasPngPreviews = pngPreviews && pngPreviews.length > 0;
    return (hasPngPreviews ? 1 : 0) + (stlModels ? stlModels.length : 0);
  }, [selectedMap?.previews]);

  return (
    <div className="flex h-full">
      {/* Left Panel - Map List */}
      <div className="w-1/2 p-8 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto max-h-full">
        <div className="space-y-4">
          {/* Line 1: Search field, map status filter, small refresh */}
          <div className="flex items-center space-x-3">
            {/* Search field */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name or coordinates"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="zmdi zmdi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            {/* Status filter dropdown */}
            <div className="relative">
              <button
                data-dropdown-toggle
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={() => {
                  const dropdown = document.getElementById('status-dropdown');
                  dropdown.classList.toggle('hidden');
                }}
              >
                <i className="zmdi zmdi-filter-list mr-2"></i>
                Status
              </button>
              <div id="status-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                <div className="p-3 space-y-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Map Status</div>
                  {[
                    { key: 'completed', label: 'Completed', icon: 'check-circle', colorClass: 'text-green-500' },
                    { key: 'incomplete', label: 'Incomplete', icon: 'pause-circle', colorClass: 'text-yellow-500' },
                    { key: 'error', label: 'Error', icon: 'close-circle', colorClass: 'text-red-500' }
                  ].map(({ key, label, icon, colorClass }) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statusFilters[key]}
                        onChange={(e) => setStatusFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <i className={`zmdi zmdi-${icon} ${colorClass}`}></i>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Small refresh button */}
            <button 
              onClick={fetchMaps}
              disabled={loading}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center"
              title="Refresh maps"
            >
              <i className={`zmdi zmdi-refresh ${loading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>

          {/* Line 2: Asset filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { 
                key: 'background', 
                label: 'Background', 
                icon: 'landscape', 
                activeClasses: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 ring-2 ring-emerald-300'
              },
              { 
                key: 'water', 
                label: 'Water', 
                icon: 'water-drop', 
                activeClasses: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 ring-2 ring-cyan-300'
              },
              { 
                key: 'flattenedRoads', 
                label: 'Flattened Roads', 
                icon: 'settings', 
                activeClasses: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 ring-2 ring-slate-300'
              },
              { 
                key: 'forests', 
                label: 'Forests', 
                icon: 'nature', 
                activeClasses: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-2 ring-green-300'
              },
              { 
                key: 'dissolved', 
                label: 'Dissolved', 
                icon: 'blur', 
                activeClasses: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 ring-2 ring-pink-300'
              },
              { 
                key: 'satelliteImages', 
                label: 'Satellite Images', 
                icon: 'satellite', 
                activeClasses: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 ring-2 ring-indigo-300'
              }
            ].map(({ key, label, icon, activeClasses }) => (
              <button
                key={key}
                onClick={() => setAssetFilters(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  assetFilters[key]
                    ? activeClasses
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <i className={`zmdi zmdi-${icon} mr-1 text-xs`}></i>
                {label}
              </button>
            ))}
          </div>
          
          {/* Results info with pagination - always present to prevent layout shift */}
          <div className="flex items-center justify-between text-sm h-8">
            <div className="text-gray-600 dark:text-gray-400 flex items-center">
              {(searchQuery || Object.values(statusFilters).some(v => v === false) || Object.values(assetFilters).some(v => v === true) || totalPages > 1) ? (
                <>
                  Showing {startIndex + 1}-{Math.min(startIndex + mapsPerPage, filteredMaps.length)} of {filteredMaps.length} maps
                  {searchQuery && <span> • Search: &ldquo;{searchQuery}&rdquo;</span>}
                </>
              ) : (
                <span>&nbsp;</span> // Invisible placeholder to maintain height
              )}
            </div>
            
            {/* Pagination controls - always reserve space */}
            <div className="flex items-center space-x-2 min-w-[120px] justify-end h-8">
              {totalPages > 1 ? (
                <>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="zmdi zmdi-chevron-left text-sm"></i>
                  </button>
                  
                  <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[60px] text-center flex items-center justify-center h-8">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="zmdi zmdi-chevron-right text-sm"></i>
                  </button>
                </>
              ) : (
                <span>&nbsp;</span> // Invisible placeholder to maintain space
              )}
            </div>
          </div>
          
          {error ? (
            <div className="text-center py-12 text-red-500 dark:text-red-400">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-lg font-medium mb-2">Error Loading Maps</div>
              <div className="text-sm mb-4">{error}</div>
              <button 
                onClick={fetchMaps}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4 animate-spin">⚙️</div>
              <div className="text-lg font-medium mb-2">Loading Maps...</div>
              <div className="text-sm">Scanning map directory...</div>
            </div>
          ) : maps.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">🗺️</div>
              <div className="text-lg font-medium mb-2">No maps yet</div>
              <div className="text-sm">Generate your first map using the Generator tab!</div>
            </div>
          ) : filteredMaps.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-lg font-medium mb-2">No maps match your filters</div>
              <div className="text-sm">Try adjusting your search or filter criteria</div>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedMaps.map((map) => (
                <div
                  key={map.id}
                  onClick={() => handleMapSelect(map)}
                  className={`relative p-4 rounded-lg border cursor-pointer transition-all overflow-hidden ${
                    selectedMap?.id === map.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                  }`}
                >
                  {/* Linear gradient from right side */}
                  <div 
                    className="absolute top-0 right-0 w-40 h-full opacity-15 pointer-events-none"
                    style={{
                      background: `linear-gradient(to left, ${
                        map.status === 'completed' ? 'rgb(34, 197, 94)' :  // green-500
                        map.status === 'generating' ? 'rgb(59, 130, 246)' : // blue-500
                        map.status === 'error' ? 'rgb(239, 68, 68)' :       // red-500
                        'rgb(234, 179, 8)'                                   // yellow-500
                      } 0%, ${
                        map.status === 'completed' ? 'rgba(34, 197, 94, 0.4)' :
                        map.status === 'generating' ? 'rgba(59, 130, 246, 0.4)' :
                        map.status === 'error' ? 'rgba(239, 68, 68, 0.4)' :
                        'rgba(234, 179, 8, 0.4)'
                      } 40%, transparent 100%)`
                    }}
                  ></div>
                  
                  {/* Status indicator aligned with content */}
                  <div className="relative flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {map.name}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      {/* Progress for generating maps */}
                      {map.status === 'generating' && map.progress && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {map.progress}%
                        </div>
                      )}
                      
                      {/* Status icon */}
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${getStatusColor(map.status)} bg-opacity-20`}>
                        {getStatusIcon(map.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between items-center py-1">
                      <span className="flex items-center">
                        <i className="zmdi zmdi-pin text-blue-500 w-5 mr-2 text-base flex-shrink-0"></i>
                        Coordinates:
                      </span>
                      <span className="font-mono text-xs text-gray-900 dark:text-gray-100 text-right">{map.coordinates}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="flex items-center">
                        <i className="zmdi zmdi-crop-landscape text-green-500 w-5 mr-2 text-base flex-shrink-0"></i>
                        Size:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{map.size}m</span>
                    </div>
                    {map.mainSettings?.output_size && (
                      <div className="flex justify-between items-center py-1">
                        <span className="flex items-center">
                          <i className="zmdi zmdi-aspect-ratio text-orange-500 w-5 mr-2 text-base flex-shrink-0"></i>
                          Output Size:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{map.mainSettings.output_size}px</span>
                      </div>
                    )}
                    {map.mainSettings?.rotation !== undefined && map.mainSettings?.rotation !== null && map.mainSettings.rotation !== 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="flex items-center">
                          <i className="zmdi zmdi-rotate-right text-purple-500 w-5 mr-2 text-base flex-shrink-0"></i>
                          Rotation:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{map.mainSettings.rotation}°</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="flex items-center">
                        <i className="zmdi zmdi-gamepad text-indigo-500 w-5 mr-2 text-base flex-shrink-0"></i>
                        Game:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-2">{map.game}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="flex items-center">
                        <i className="zmdi zmdi-time text-gray-500 w-5 mr-2 text-base flex-shrink-0"></i>
                        Created:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{map.createdAt}</span>
                    </div>
                  </div>

                  {/* Additional info pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {/* Version */}
                    {map.mainSettings?.version && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        <i className="zmdi zmdi-tag mr-1 text-xs"></i>
                        {map.mainSettings.version}
                      </span>
                    )}
                    
                    {/* DTM Provider */}
                    {map.dtmProvider && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <i className="zmdi zmdi-globe-alt mr-1 text-xs"></i>
                        {map.dtmProvider}
                      </span>
                    )}
                    
                    {/* Custom OSM */}
                    {map.mainSettings?.custom_osm && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        <i className="zmdi zmdi-map mr-1 text-xs"></i>
                        Custom OSM
                      </span>
                    )}
                    
                    {/* Custom DEM */}
                    {map.mainSettings?.custom_dem && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        <i className="zmdi zmdi-landscape mr-1 text-xs"></i>
                        Custom DEM
                      </span>
                    )}
                    
                    {/* Generation Settings Pills */}
                    {map.generationSettings?.DEMSettings?.add_foundations && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        <i className="zmdi zmdi-layers mr-1 text-xs"></i>
                        Foundations
                      </span>
                    )}
                    
                    {map.generationSettings?.BackgroundSettings?.generate_background && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <i className="zmdi zmdi-landscape mr-1 text-xs"></i>
                        Background
                      </span>
                    )}
                    
                    {map.generationSettings?.BackgroundSettings?.generate_water && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                        <i className="zmdi zmdi-water-drop mr-1 text-xs"></i>
                        Water
                      </span>
                    )}
                    
                    {map.generationSettings?.BackgroundSettings?.flatten_roads && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                        <i className="zmdi zmdi-settings mr-1 text-xs"></i>
                        Flattened Roads
                      </span>
                    )}
                    
                    {map.generationSettings?.I3DSettings?.add_trees && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <i className="zmdi zmdi-nature mr-1 text-xs"></i>
                        Forests
                      </span>
                    )}
                    
                    {map.generationSettings?.TextureSettings?.dissolve && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                        <i className="zmdi zmdi-blur mr-1 text-xs"></i>
                        Dissolved
                      </span>
                    )}
                    
                    {map.generationSettings?.SatelliteSettings?.download_images && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <i className="zmdi zmdi-satellite mr-1 text-xs"></i>
                        Satellite Images
                      </span>
                    )}
                  </div>

                  {map.status === 'generating' && map.progress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{map.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${map.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {map.status === 'error' && map.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                      <strong>Error:</strong> {map.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Map Details */}
      <div className="w-1/2 p-8 overflow-y-auto max-h-full">
        {!selectedMap ? (
          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400 space-y-2">
              <div className="text-2xl">📋</div>
              <div className="text-lg font-medium">Map Details</div>
              <div className="text-sm max-w-sm">
                Select a map from the list to see its details and available actions
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Map Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {/* Status icon on the left */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getStatusColor(selectedMap.status)} bg-opacity-10`}>
                  {getStatusIcon(selectedMap.status)}
                </div>
                
                <div className="relative group flex-1">
                  {editingName ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={handleNameBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNameSave();
                        if (e.key === 'Escape') handleNameCancel();
                      }}
                      className="w-full text-2xl font-bold bg-transparent border border-blue-500 outline-none text-gray-900 dark:text-gray-100 rounded px-2 py-1 transition-all"
                      autoFocus
                      disabled={savingName}
                    />
                  ) : (
                    <h1 
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 border border-transparent rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={handleNameEdit}
                      title="Click to edit name"
                    >
                      {selectedMap.name}
                      {savingName && <i className="zmdi zmdi-refresh zmdi-hc-spin ml-2 text-blue-500"></i>}
                    </h1>
                  )}
                </div>
              </div>
              
              {/* Progress indicator for generating status */}
              {selectedMap.status === 'generating' && selectedMap.progress && (
                <div className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                  {selectedMap.progress}%
                </div>
              )}
            </div>
            
            {/* Generation Settings Badges */}
            <div className="flex flex-wrap gap-2">
              {selectedMap.generationSettings?.DEMSettings?.add_foundations && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <i className="zmdi zmdi-layers mr-2"></i>
                  Foundations
                </span>
              )}
              
              {selectedMap.generationSettings?.BackgroundSettings?.generate_background && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <i className="zmdi zmdi-landscape mr-2"></i>
                  Background
                </span>
              )}
              
              {selectedMap.generationSettings?.BackgroundSettings?.generate_water && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                  <i className="zmdi zmdi-water-drop mr-2"></i>
                  Water
                </span>
              )}
              
              {selectedMap.generationSettings?.BackgroundSettings?.flatten_roads && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                  <i className="zmdi zmdi-settings mr-2"></i>
                  Flattened Roads
                </span>
              )}
              
              {selectedMap.generationSettings?.I3DSettings?.add_trees && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <i className="zmdi zmdi-nature mr-2"></i>
                  Forests
                </span>
              )}
              
              {selectedMap.generationSettings?.TextureSettings?.dissolve && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                  <i className="zmdi zmdi-blur mr-2"></i>
                  Dissolved
                </span>
              )}
              
              {selectedMap.generationSettings?.SatelliteSettings?.download_images && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <i className="zmdi zmdi-satellite mr-2"></i>
                  Satellite Images
                </span>
              )}
            </div>

            {/* Map Preview */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden relative">
              {selectedMap.previews && selectedMap.previews.length > 0 ? (
                <>
                  <MixedPreviewGallery
                    key={selectedMap.id} // Force re-render when map changes
                    previews={selectedMap.previews}
                    taskId={selectedMap.id}
                    currentPage={previewPage}
                    onError={(error) => console.error('Preview error:', error)}
                  />
                  <SlideNavigator
                    currentPage={previewPage}
                    totalPages={totalPreviewPages}
                    onPageChange={setPreviewPage}
                  />
                </>
              ) : selectedMap.status === 'completed' ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                  <div className="text-4xl">📁</div>
                  <div className="text-lg font-medium text-gray-600 dark:text-gray-400">
                    No Previews Available
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Preview files may not have been generated
                  </div>
                </div>
              ) : selectedMap.status === 'generating' ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <div className="text-4xl animate-spin">⚙️</div>
                  <div className="text-lg font-medium text-gray-600 dark:text-gray-400">
                    Map Generation in Progress
                  </div>
                  {selectedMap.progress && (
                    <div className="w-1/2">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{selectedMap.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${selectedMap.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedMap.status === 'error' ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                  <div className="text-4xl">❌</div>
                  <div className="text-lg font-medium text-red-600 dark:text-red-400">
                    Generation Failed
                  </div>
                  {selectedMap.error && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
                      {selectedMap.error}
                    </div>
                  )}
                </div>
              ) : selectedMap.status === 'incomplete' ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                  <div className="text-4xl">⏸️</div>
                  <div className="text-lg font-medium text-yellow-600 dark:text-yellow-400">
                    Generation Incomplete
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
                    Map generation was stopped or not finished yet
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                  <div className="text-4xl">❓</div>
                  <div className="text-lg font-medium text-gray-600 dark:text-gray-400">
                    Unknown Status
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
                    Unable to determine map status
                  </div>
                </div>
              )}
            </div>

            {/* Map Information and Actions */}
            <div className="grid grid-cols-2 gap-6 items-start">
              {/* Map Information - Left Column */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Map Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <i className="zmdi zmdi-pin text-blue-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                      Coordinates:
                    </span>
                    <span className="font-mono text-xs text-gray-900 dark:text-gray-100 text-right">{formatCoordinates(selectedMap.coordinates)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <i className="zmdi zmdi-crop-landscape text-green-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                      Size:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedMap.size}<span className="text-sm text-gray-500 ml-1">meters</span></span>
                  </div>
                  {selectedMap.mainSettings?.output_size && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <i className="zmdi zmdi-aspect-ratio text-orange-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                        Output Size:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedMap.mainSettings.output_size}<span className="text-sm text-gray-500 ml-1">pixels</span></span>
                    </div>
                  )}
                  {selectedMap.mainSettings?.rotation !== undefined && selectedMap.mainSettings?.rotation !== null && selectedMap.mainSettings.rotation !== 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <i className="zmdi zmdi-rotate-right text-purple-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                        Rotation:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedMap.mainSettings.rotation}<span className="text-sm text-gray-500 ml-1">degrees</span></span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <i className="zmdi zmdi-gamepad text-indigo-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                      Game:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedMap.game}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <i className="zmdi zmdi-time text-gray-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                      Created:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedMap.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Actions - Right Column */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions</h3>
                <div className="space-y-3 flex-1 flex flex-col justify-start">
                  {/* Status-specific actions first */}
                  {selectedMap.status === 'completed' && (
                    <button 
                      onClick={handleDownloadMap}
                      disabled={downloading}
                      className={`w-full px-4 py-3 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center ${
                        downloading 
                          ? 'bg-green-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {downloading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Creating Archive...
                        </>
                      ) : (
                        <>
                          <i className="zmdi zmdi-download mr-2"></i>
                          Download Map
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Duplicate Map - Position 2 with primary blue */}
                  {selectedMap.status === 'completed' && (
                    <button 
                      onClick={handleDuplicateMapClick}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                    >
                      <i className="zmdi zmdi-copy mr-2"></i>
                      Duplicate Map
                    </button>
                  )}
                  
                  {/* JSON Viewer Actions - Positions 3, 4 & 5 with grey */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleShowJSON('main_settings')}
                      className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                    >
                      <i className="zmdi zmdi-settings mr-2"></i>
                      Main Settings
                    </button>
                    <button
                      onClick={() => handleSaveToPresets('mainSettings', selectedMap.mainSettings, selectedMap.name)}
                      className="px-4 py-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center justify-center"
                      title="Save to Presets"
                    >
                      <i className="zmdi zmdi-bookmark"></i>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleShowJSON('generation_settings')}
                      className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                    >
                      <i className="zmdi zmdi-code mr-2"></i>
                      Generation Settings
                    </button>
                    <button
                      onClick={() => handleSaveToPresets('generationSettings', selectedMap.generationSettings, selectedMap.name)}
                      className="px-4 py-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center justify-center"
                      title="Save to Presets"
                    >
                      <i className="zmdi zmdi-bookmark"></i>
                    </button>
                  </div>
                  <button 
                    onClick={() => handleShowJSON('generation_info')}
                    className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                  >
                    <i className="zmdi zmdi-info mr-2"></i>
                    Generation Info
                  </button>
                  
                  {/* Custom OSM and DEM Actions */}
                  {selectedMap.mainSettings?.custom_osm && (
                    <button 
                      onClick={() => handleSaveCustomOsm(selectedMap.id, selectedMap.name)}
                      className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                    >
                      <i className="zmdi zmdi-bookmark mr-2"></i>
                      Save Custom OSM to Presets
                    </button>
                  )}
                  
                  {selectedMap.mainSettings?.custom_dem && (
                    <button 
                      onClick={() => handleSaveCustomDem(selectedMap.id, selectedMap.name)}
                      className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                    >
                      <i className="zmdi zmdi-bookmark mr-2"></i>
                      Save Custom DEM to Presets
                    </button>
                  )}

                  {/* Map-local schema preview & save buttons */}
                  {mapSchemaPaths.texture && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/files/content', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ filePath: mapSchemaPaths.texture })
                            });
                            if (!res.ok) throw new Error('Failed to load texture schema');
                            const content = await res.text();
                            setJsonData(JSON.parse(content));
                            setJsonType('Texture Schema (map-local)');
                            setShowJSONModal(true);
                          } catch (err) {
                            console.error('Error previewing texture schema:', err);
                            showToast('Failed to preview texture schema', 'error');
                          }
                        }}
                        className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                      >
                        <i className="zmdi zmdi-image mr-2"></i>
                        Preview Texture Schema
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/files/copy-to-templates', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ sourcePath: mapSchemaPaths.texture, game: selectedMap.mainSettings.game || selectedMap.game || 'fs25', type: 'texture', mapName: selectedMap.name })
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || 'Failed to save texture schema');
                            showToast('Texture schema saved to templates', 'success');
                            // Refresh Settings tab or templates listing is manual, but update local state
                            setMapSchemaPaths(prev => ({ ...prev }));
                          } catch (err) {
                            console.error('Error saving texture schema:', err);
                            showToast('Failed to save texture schema', 'error');
                          }
                        }}
                        className="px-4 py-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center justify-center"
                        title="Save texture schema to templates"
                      >
                        <i className="zmdi zmdi-bookmark"></i>
                      </button>
                    </div>
                  )}

                  {mapSchemaPaths.tree && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/files/content', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ filePath: mapSchemaPaths.tree })
                            });
                            if (!res.ok) throw new Error('Failed to load tree schema');
                            const content = await res.text();
                            setJsonData(JSON.parse(content));
                            setJsonType('Tree Schema (map-local)');
                            setShowJSONModal(true);
                          } catch (err) {
                            console.error('Error previewing tree schema:', err);
                            showToast('Failed to preview tree schema', 'error');
                          }
                        }}
                        className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                      >
                        <i className="zmdi zmdi-nature mr-2"></i>
                        Preview Tree Schema
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/files/copy-to-templates', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ sourcePath: mapSchemaPaths.tree, game: selectedMap.mainSettings.game || selectedMap.game || 'fs25', type: 'tree', mapName: selectedMap.name })
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || 'Failed to save tree schema');
                            showToast('Tree schema saved to templates', 'success');
                            setMapSchemaPaths(prev => ({ ...prev }));
                          } catch (err) {
                            console.error('Error saving tree schema:', err);
                            showToast('Failed to save tree schema', 'error');
                          }
                        }}
                        className="px-4 py-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center justify-center"
                        title="Save tree schema to templates"
                      >
                        <i className="zmdi zmdi-bookmark"></i>
                      </button>
                    </div>
                  )}
                  
                  {/* Other status-specific actions */}
                  {(selectedMap.status === 'error' || selectedMap.status === 'incomplete') && (
                    <button 
                      onClick={handleRetryMapClick}
                      className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center"
                    >
                      <i className="zmdi zmdi-refresh mr-2"></i>
                      Retry Generation
                    </button>
                  )}
                  <button 
                    onClick={handleDeleteMap}
                    disabled={deleting}
                    className={`w-full px-4 py-3 text-white text-sm font-medium rounded-lg transition-colors text-left flex items-center ${
                      deleting 
                        ? 'bg-red-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="zmdi zmdi-delete mr-2"></i>
                        Delete Map
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Details */}
            {selectedMap.status === 'error' && selectedMap.error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Error Details</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{selectedMap.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* JSON Editor Modal */}
      <JSONEditorModal
        isOpen={showJSONModal}
        onClose={() => setShowJSONModal(false)}
        jsonData={jsonData}
        title={jsonType}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                <i className="zmdi zmdi-alert-triangle text-red-600 dark:text-red-400 text-lg"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Delete Map
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete <span className="font-semibold">&ldquo;{selectedMap?.name}&rdquo;</span>?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                This action cannot be undone. The entire map directory will be permanently removed.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMap}
                disabled={deleting}
                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center ${
                  deleting 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="zmdi zmdi-delete mr-2"></i>
                    Delete Map
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' && <i className="zmdi zmdi-check-circle text-lg"></i>}
              {toast.type === 'error' && <i className="zmdi zmdi-alert-circle text-lg"></i>}
              {toast.type === 'info' && <i className="zmdi zmdi-info text-lg"></i>}
            </div>
            <div className="flex-1 text-sm font-medium">
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
