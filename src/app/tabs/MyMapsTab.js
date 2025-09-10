'use client';

import { useState, useEffect, useMemo } from 'react';
import MixedPreviewGallery from '@/components/MixedPreviewGallery';
import SlideNavigator from '@/components/SlideNavigator';
import { separateFilesByType } from '@/utils/fileTypeUtils';

export default function MyMapsTab() {
  const [selectedMap, setSelectedMap] = useState(null);
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewPage, setPreviewPage] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [savingName, setSavingName] = useState(false);

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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Maps</h2>
            <button 
              onClick={fetchMaps}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <i className={`zmdi zmdi-refresh mr-2 ${loading ? 'animate-spin' : ''}`}></i>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
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
          ) : (
            <div className="space-y-3">
              {maps.map((map) => (
                <div
                  key={map.id}
                  onClick={() => handleMapSelect(map)}
                  className={`relative p-4 rounded-lg border cursor-pointer transition-all overflow-hidden ${
                    selectedMap?.id === map.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                  }`}
                >
                  {/* Subtle radial gradient from top-right corner */}
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 opacity-25 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at top right, ${
                        map.status === 'completed' ? 'rgb(34, 197, 94)' :  // green-500
                        map.status === 'generating' ? 'rgb(59, 130, 246)' : // blue-500
                        map.status === 'error' ? 'rgb(239, 68, 68)' :       // red-500
                        'rgb(234, 179, 8)'                                   // yellow-500
                      } 0%, ${
                        map.status === 'completed' ? 'rgba(34, 197, 94, 0.6)' :
                        map.status === 'generating' ? 'rgba(59, 130, 246, 0.6)' :
                        map.status === 'error' ? 'rgba(239, 68, 68, 0.6)' :
                        'rgba(234, 179, 8, 0.6)'
                      } 25%, transparent 65%)`
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
                      <span className="font-mono text-xs text-gray-900 dark:text-gray-100">{map.coordinates}</span>
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
                    Map generation was stopped or interrupted
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

            {/* Map Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Map Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <i className="zmdi zmdi-pin text-blue-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                      Coordinates:
                    </span>
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedMap.coordinates}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <i className="zmdi zmdi-crop-landscape text-green-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                      Size:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedMap.size}<span className="text-sm text-gray-500 ml-1">meters</span></span>
                  </div>
                  {selectedMap.mainSettings?.output_size && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <i className="zmdi zmdi-aspect-ratio text-orange-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                        Output Size:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedMap.mainSettings.output_size}<span className="text-sm text-gray-500 ml-1">pixels</span></span>
                    </div>
                  )}
                  {selectedMap.mainSettings?.rotation !== undefined && selectedMap.mainSettings?.rotation !== null && selectedMap.mainSettings.rotation !== 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <i className="zmdi zmdi-rotate-right text-purple-500 w-6 mr-3 text-lg flex-shrink-0"></i>
                        Rotation:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedMap.mainSettings.rotation}<span className="text-sm text-gray-500 ml-1">degrees</span></span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
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

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Actions</h3>
                <div className="space-y-2">
                  {selectedMap.status === 'completed' && (
                    <>
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-left">
                        <i className="zmdi zmdi-download mr-2"></i>
                        Download Map Files
                      </button>
                      <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors text-left">
                        <i className="zmdi zmdi-copy mr-2"></i>
                        Duplicate Map
                      </button>
                    </>
                  )}
                  {(selectedMap.status === 'error' || selectedMap.status === 'incomplete') && (
                    <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors text-left">
                      <i className="zmdi zmdi-refresh mr-2"></i>
                      Retry Generation
                    </button>
                  )}
                  <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors text-left">
                    <i className="zmdi zmdi-delete mr-2"></i>
                    Delete Map
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
    </div>
  );
}
