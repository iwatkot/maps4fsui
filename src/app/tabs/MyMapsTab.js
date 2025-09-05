'use client';

import { useState, useEffect } from 'react';

export default function MyMapsTab() {
  const [selectedMap, setSelectedMap] = useState(null);
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'generating': return '⏳';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  return (
    <div className="flex flex-1">
      {/* Left Panel - Map List */}
      <div className="w-1/2 p-8 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
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
                  onClick={() => setSelectedMap(map)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedMap?.id === map.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {map.name}
                    </h3>
                    <div className={`flex items-center space-x-1 ${getStatusColor(map.status)}`}>
                      <span className="text-sm">{getStatusIcon(map.status)}</span>
                      <span className="text-xs font-medium capitalize">{map.status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="font-mono text-xs">{map.coordinates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{map.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Game:</span>
                      <span className="truncate ml-2">{map.game}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{map.createdAt}</span>
                    </div>
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

                  {map.status === 'failed' && map.error && (
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
      <div className="w-1/2 p-8">
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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedMap.name}
                </h1>
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMap.status)}`}>
                  <span>{getStatusIcon(selectedMap.status)}</span>
                  <span className="capitalize">{selectedMap.status}</span>
                  {selectedMap.status === 'generating' && selectedMap.progress && (
                    <span>({selectedMap.progress}%)</span>
                  )}
                </div>
              </div>
              
              {selectedMap.status === 'completed' && (
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <i className="zmdi zmdi-download mr-2"></i>
                    Download
                  </button>
                  <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <i className="zmdi zmdi-share mr-2"></i>
                    Share
                  </button>
                </div>
              )}
            </div>

            {/* Map Preview */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
              {selectedMap.status === 'completed' ? (
                <img
                  src={selectedMap.thumbnail}
                  alt={`Preview of ${selectedMap.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hcCBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
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
              ) : (
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
              )}
            </div>

            {/* Map Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Map Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Coordinates:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{selectedMap.coordinates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Size:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedMap.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Game:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedMap.game}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedMap.createdAt}</span>
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
                  {selectedMap.status === 'failed' && (
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
            {selectedMap.status === 'failed' && selectedMap.error && (
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
