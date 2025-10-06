'use client';

import { useState, useEffect } from 'react';
import JSONEditorModal from '@/components/JSONEditorModal';
import config from '@/app/config';
import { getAuthenticatedFetch } from '@/utils/authenticatedFetch';

/**
 * PresetsTab - Tab for managing presets (OSM, DEM, Main Settings, Generation Settings)
 */
export default function PresetsTab() {
  const [activeSection, setActiveSection] = useState('osm');
  const [files, setFiles] = useState({
    osm: [],
    dem: [],
    mainSettings: [],
    generationSettings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewType, setPreviewType] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Tab configuration
  const tabs = [
    { id: 'osm', label: 'OSM', icon: <i className="zmdi zmdi-map"></i> },
    { id: 'dem', label: 'DEM', icon: <i className="zmdi zmdi-landscape"></i> },
    { id: 'mainSettings', label: 'Main Settings', icon: <i className="zmdi zmdi-settings"></i> },
    { id: 'generationSettings', label: 'Generation Settings', icon: <i className="zmdi zmdi-tune"></i> }
  ];

  // Load files for all sections
  useEffect(() => {
    loadAllFiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.allSettled([
        loadSectionFiles('osm'),
        loadSectionFiles('dem'), 
        loadSectionFiles('mainSettings'),
        loadSectionFiles('generationSettings')
      ]);

      const newFiles = {
        osm: results[0].status === 'fulfilled' ? results[0].value : [],
        dem: results[1].status === 'fulfilled' ? results[1].value : [],
        mainSettings: results[2].status === 'fulfilled' ? results[2].value : [],
        generationSettings: results[3].status === 'fulfilled' ? results[3].value : []
      };

      setFiles(newFiles);
      
      // Check for any errors
      const errors = results.filter(r => r.status === 'rejected').map(r => r.reason);
      if (errors.length > 0) {
        console.warn('Some sections failed to load:', errors);
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
      setError('Failed to load presets');
    } finally {
      setLoading(false);
    }
  };

  const loadSectionFiles = async (section) => {
    const sectionMap = {
      osm: 'mfsDefaultsOsmDir',
      dem: 'mfsDefaultsDemDir',
      mainSettings: 'mfsDefaultsMSettingsDir',
      generationSettings: 'mfsDefaultsGSettingsDir'
    };

    const dirPath = config[sectionMap[section]];
    
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
      case 'osm': return ['.osm'];
      case 'dem': return ['.png'];
      case 'mainSettings':
      case 'generationSettings': return ['.json'];
      default: return [];
    }
  };

  const getSectionDescription = (section) => {
    switch (section) {
      case 'osm':
        return (
          <div>
            <p className="mb-2">
              OSM files contain OpenStreetMap data used to generate realistic map features including roads, buildings, 
              forests, and water bodies. These files define the layout and structure of your map.
            </p>
            <p className="text-sm">
              📖 Learn more: {' '}
              <a 
                href="https://maps4fs.gitbook.io/docs/advanced-topics/custom_osm" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Custom OSM Documentation
              </a>
            </p>
          </div>
        );
      case 'dem':
        return (
          <div>
            <p className="mb-2">
              DEM (Digital Elevation Model) files are PNG heightmaps that define the terrain elevation for both 
              the playable area and background landscape. Proper preparation is essential for realistic terrain.
            </p>
            <p className="text-sm">
              📖 Learn more: {' '}
              <a 
                href="https://maps4fs.gitbook.io/docs/advanced-topics/custom_dem" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Custom DEM Documentation
              </a>
            </p>
          </div>
        );
      case 'mainSettings':
        return (
          <div>
            <p className="mb-2">
              Main Settings define the core parameters for map generation including game version, coordinates, 
              map size, rotation, and other fundamental properties that control the overall map structure.
            </p>
            <p className="text-sm">
              📖 Learn more: {' '}
              <a 
                href="https://maps4fs.gitbook.io/docs/getting-started/step_by_step_guide#main-settings-overview" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Main Settings Overview
              </a>
            </p>
          </div>
        );
      case 'generationSettings':
        return (
          <div>
            <p className="mb-2">
              Generation Settings control various aspects of the map creation process including background terrain 
              generation, water planes, field boundaries, forest density, and other detailed generation parameters.
            </p>
            <p className="text-sm">
              📖 Learn more: {' '}
              <a 
                href="https://maps4fs.gitbook.io/docs/understanding-the-basics/generation_settings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Generation Settings Guide
              </a>
            </p>
          </div>
        );
      default:
        return <p>Manage your preset files</p>;
    }
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
      } else if (file.name.endsWith('.png')) {
        // For PNG files, create preview data for PreviewGallery
        const imageUrl = `/api/files/content?filePath=${encodeURIComponent(file.path)}`;
        setPreviewData([{
          url: imageUrl,
          filename: file.name,
          size: file.size,
          isLocal: true // Flag to indicate this is a local Next.js API route
        }]);
        setPreviewType('image');
      } else if (file.name.endsWith('.osm')) {
        // For OSM files, load as text content
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
        setPreviewData(content);
        setPreviewType('osm');
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
    // Placeholder for set as default logic
    showToast(`Set "${file.name}" as default (functionality coming soon)`);
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
    } else if (previewType === 'image') {
      const imageUrl = previewData[0]?.url;
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
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
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
              <img 
                src={imageUrl}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error('Failed to load image:', e);
                  showToast('Failed to load image', 'error');
                }}
              />
            </div>
          </div>
        </div>
      );
    } else if (previewType === 'osm') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
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
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                {previewData}
              </pre>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderFileTable = (sectionFiles) => {
    if (sectionFiles.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No files found in this section
        </div>
      );
    }

    return (
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
            {sectionFiles.map((file, index) => (
              <FileRow
                key={`${file.path}-${index}`}
                file={file}
                onPreview={handlePreview}
                onRename={handleRename}
                onSetAsDefault={handleSetAsDefault}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading presets...</p>
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

      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  activeSection === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
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
              {tabs.find(t => t.id === activeSection)?.label} Presets
            </h2>
            <div className="text-gray-600 dark:text-gray-400">
              {getSectionDescription(activeSection)}
            </div>
          </div>

          {renderFileTable(files[activeSection])}
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
                Are you sure you want to delete <span className="font-semibold">"{fileToDelete.name}"</span>? 
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
function FileRow({ file, onPreview, onRename, onSetAsDefault, onDelete }) {
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
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {file.name}
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