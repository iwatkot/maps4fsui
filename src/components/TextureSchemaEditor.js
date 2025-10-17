'use client';

import { useState, useEffect } from 'react';
import JSONEditorModal from './JSONEditorModal';
import SaveSchemaModal from './SaveSchemaModal';
import SelectorCompact from './SelectorCompact';
import { getTextureSchema } from '../api/schemas';

// Hardcoded texture URLs for preview images
const TEXTURE_URLS = {
  "asphalt": "https://github.com/user-attachments/assets/a1a5f095-9a14-4b9c-af42-a3399157e17e",
  "asphaltCracks": "https://github.com/user-attachments/assets/4c124557-0c5e-45f3-906f-937c6a1f284a",
  "asphaltDirt": "https://github.com/user-attachments/assets/89fb98aa-3bc4-4a45-b2cf-5a7aafe4aa07",
  "asphaltDusty": "https://github.com/user-attachments/assets/cdbcda8c-5d4c-4f0a-9869-7b11f7cfbade",
  "asphaltGravel": "https://github.com/user-attachments/assets/3754efbc-bbff-4845-884d-14a176d6b174",
  "asphaltTwigs": "https://github.com/user-attachments/assets/513aa2a9-e8f5-4b34-858c-ff54d242e684",
  "concrete": "https://github.com/user-attachments/assets/544737ff-0e83-4a37-9751-efc275f7510d",
  "concreteGravelSand": "https://github.com/user-attachments/assets/24100801-55b7-45b2-93f1-fb53a07b1d61",
  "concretePebbles": "https://github.com/user-attachments/assets/ff793ba6-9e54-4f3e-a21e-8e096bf63839",
  "concreteShattered": "https://github.com/user-attachments/assets/9d0b22ed-4435-4bea-801b-1bda45cddb83",
  "forestGrass": "https://github.com/user-attachments/assets/6b215423-2034-40fb-a678-eaa075373854",
  "forestLeaves": "https://github.com/user-attachments/assets/b5bb051f-b647-4faa-b9a3-90ce4a77a48e",
  "forestNeedels": "https://github.com/user-attachments/assets/91df605e-eda6-4221-a572-8fb84df5c987",
  "forestRockRoots": "https://github.com/user-attachments/assets/7804a25a-1803-41e4-93d8-b1fcf8b701b1",
  "grass": "https://github.com/user-attachments/assets/30469cf8-f984-4359-8c0c-8387b44ae519",
  "grassClovers": "https://github.com/user-attachments/assets/03a7e881-4f8a-46dd-8e2a-672a7d82cf2f",
  "grassCut": "https://github.com/user-attachments/assets/c54249e8-2deb-46e8-baf5-784d949dfd34",
  "grassDirtPatchy": "https://github.com/user-attachments/assets/20168e61-585d-43bf-bc07-dca74d652d89",
  "grassDirtPatchyDry": "https://github.com/user-attachments/assets/90eea824-7d03-4060-8e57-cce29f72ba64",
  "grassDirtStones": "https://github.com/user-attachments/assets/3acc201a-ee21-4492-a746-150a6e4b310a",
  "grassFreshMiddle": "https://github.com/user-attachments/assets/2aca54e6-68db-44d3-9c8f-998522ca18ba",
  "grassFreshShort": "https://github.com/user-attachments/assets/103d6efd-032e-4672-b717-ba64d9f9cd9c",
  "grassMoss": "https://github.com/user-attachments/assets/8e5a7dff-987c-4772-8531-e237c7aa0cee",
  "gravel": "https://github.com/user-attachments/assets/d0c8de3f-191c-43a7-899d-902e63b10553",
  "gravelDirtMoss": "https://github.com/user-attachments/assets/b618bba2-f4a4-4b7b-881f-6462c98fc666",
  "gravelPebblesMoss": "https://github.com/user-attachments/assets/48332684-6878-4aab-b917-ddaea3338abe",
  "gravelPebblesMossPatchy": "https://github.com/user-attachments/assets/5e1acd59-7674-470e-b5b0-307ea9b250e1",
  "gravelSmall": "https://github.com/user-attachments/assets/acf725c6-d295-4c92-bb42-e761bdf2feb1",
  "mudDark": "https://github.com/user-attachments/assets/c6ce48ab-13c1-4000-a75a-673ebd451149",
  "mudDarkGrassPatchy": "https://github.com/user-attachments/assets/8c70e8a7-e561-4028-8f23-0e41fb0b4e76",
  "mudDarkMossPatchy": "https://github.com/user-attachments/assets/e21b538f-c52e-465b-b88a-a93f87d01584",
  "mudLeaves": "https://github.com/user-attachments/assets/540263bf-807d-4159-99f0-8c1493075834",
  "mudLight": "https://github.com/user-attachments/assets/58aa1d41-15bd-4d03-8eed-1e20fcb39cf4",
  "mudPebbles": "https://github.com/user-attachments/assets/e51cac8e-dd4b-4e76-8a8d-7320182fc652",
  "mudPebblesLight": "https://github.com/user-attachments/assets/6973aaf7-2894-430d-9ba0-ece78e4b55d7",
  "mudTracks": "https://github.com/user-attachments/assets/d4a222bb-6f2b-459d-8a36-38e1a31a46ba",
  "pebblesForestGround": "https://github.com/user-attachments/assets/ffb1a80d-1338-4e9e-84db-aa157d894617",
  "rock": "https://github.com/user-attachments/assets/a1a78285-b7c3-4a2a-b2ec-fbae4898f566",
  "rockFloorTiles": "https://github.com/user-attachments/assets/7068057b-b2c8-4952-ab88-47afa700c488",
  "rockFloorTilesPattern": "https://github.com/user-attachments/assets/6be8c2a3-d3c7-4951-82b5-8780068e20c5",
  "rockForest": "https://github.com/user-attachments/assets/ef7ee19a-c1b9-4371-a5b2-3309118ef981",
  "rockyForestGround": "https://github.com/user-attachments/assets/5e08392b-ec91-466a-8c46-2a632015c4bb",
  "sand": "https://github.com/user-attachments/assets/4c79b020-cbc3-40ea-ae7f-04599309ef80"
};

const TextureSchemaEditor = ({ activeSchemaType, onSchemaTypeChange }) => {
  const [textures, setTextures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingTexture, setEditingTexture] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadTextureSchema();
  }, []);

  const loadTextureSchema = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const textures = await getTextureSchema('fs25');
      setTextures(textures || []);
    } catch (err) {
      console.error('Error loading texture schema:', err);
      setError('Failed to load texture schema');
    } finally {
      setLoading(false);
    }
  };

  // Filter textures based on search and category
  const filteredTextures = textures.filter(texture => {
    const matchesSearch = texture.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterCategory === 'all') return matchesSearch;
    
    // Filter by category based on texture name patterns
    switch (filterCategory) {
      case 'asphalt':
        return matchesSearch && texture.name.startsWith('asphalt');
      case 'concrete':
        return matchesSearch && texture.name.startsWith('concrete');
      case 'grass':
        return matchesSearch && texture.name.startsWith('grass');
      case 'forest':
        return matchesSearch && texture.name.startsWith('forest');
      case 'gravel':
        return matchesSearch && texture.name.startsWith('gravel');
      case 'mud':
        return matchesSearch && texture.name.startsWith('mud');
      case 'rock':
        return matchesSearch && texture.name.startsWith('rock');
      case 'sand':
        return matchesSearch && texture.name.startsWith('sand');
      default:
        return matchesSearch;
    }
  });

  const handleEditTexture = (texture) => {
    console.log('Editing texture:', texture);
    setEditingTexture(texture);
    setShowJsonModal(true);
  };

  const handleJsonSave = (updatedJson) => {
    console.log('Saving texture:', updatedJson);
    if (editingTexture) {
      const updatedTextures = textures.map(texture => 
        texture.name === editingTexture.name ? updatedJson : texture
      );
      setTextures(updatedTextures);
      setEditingTexture(null);
    }
    setShowJsonModal(false);
  };

  const generateFinalSchema = () => {
    console.log('Textures array:', textures);
    console.log('Textures length:', textures.length);
    setShowSchemaModal(true);
  };

  const handleSaveSchema = () => {
    setShowSaveModal(true);
  };

  const handleSaveSuccess = (result) => {
    console.log('Schema saved successfully:', result);
    // You can add a toast notification here if desired
  };

  const downloadSchema = () => {
    const schemaData = {
      textures: textures,
      metadata: {
        version: "fs25",
        type: "texture",
        generatedAt: new Date().toISOString(),
        totalTextures: textures.length
      }
    };
    
    const blob = new Blob([JSON.stringify(schemaData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fs25-texture-schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading texture schema...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700 dark:text-red-300 font-medium">Error loading texture schema</span>
        </div>
        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
        <button 
          onClick={loadTextureSchema}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Schema Type Selector */}
            <SelectorCompact
              options={[
                { value: 'tree', label: '🌳 Trees' },
                { value: 'texture', label: '🖼️ Textures' }
              ]}
              value={activeSchemaType}
              onChange={(value) => onSchemaTypeChange && onSchemaTypeChange(value)}
              className="min-w-[140px]"
            />

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search textures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i className="zmdi zmdi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            {/* Filter by category */}
            <SelectorCompact
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'asphalt', label: '🛣️ Asphalt' },
                { value: 'concrete', label: '🏢 Concrete' },
                { value: 'grass', label: '🌱 Grass' },
                { value: 'forest', label: '🌲 Forest' },
                { value: 'gravel', label: '🪨 Gravel' },
                { value: 'mud', label: '🟤 Mud' },
                { value: 'rock', label: '🗿 Rock' },
                { value: 'sand', label: '🏖️ Sand' }
              ]}
              value={filterCategory}
              onChange={setFilterCategory}
              className="min-w-[160px]"
            />

            {/* Texture count info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTextures.length} / {textures.length} textures shown
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={generateFinalSchema}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <i className="zmdi zmdi-code mr-2"></i>
              Show Schema
            </button>
            <button
              onClick={handleSaveSchema}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <i className="zmdi zmdi-save mr-2"></i>
              Save Schema
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        {/* Texture Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredTextures.map((texture, index) => (
          <div 
            key={index} 
            className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
            onClick={() => handleEditTexture(texture)}
          >
            {/* Texture Preview with Overlay */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
              {TEXTURE_URLS[texture.name] && (
                <img 
                  src={TEXTURE_URLS[texture.name]} 
                  alt={texture.name}
                  className="w-full h-full object-cover"
                />
              )}
              {!TEXTURE_URLS[texture.name] && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Name always visible at top with gradient shadow */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent p-3 z-20">
                <h3 className="font-medium text-white text-sm">
                  {texture.name}
                </h3>
              </div>

              {/* Edit icon in top-right corner - visible on hover, above overlay */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                <div className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>

              {/* JSON Preview overlay - appears on hover, lighter overlay */}
              <div 
                className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
              >
                <div 
                  className="h-full w-full p-3 pt-12 overflow-y-auto border-0"
                  style={{
                    border: 'none'
                  }}
                >
                  <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                    {(() => {
                      // Custom JSON formatting to make arrays more compact
                      const formatCompactJSON = (obj, indent = 0) => {
                        const spaces = '  '.repeat(indent);
                        if (Array.isArray(obj)) {
                          // Format arrays on single line if they're simple values
                          const isSimpleArray = obj.every(item => 
                            typeof item === 'string' || 
                            typeof item === 'number' || 
                            typeof item === 'boolean'
                          );
                          if (isSimpleArray && obj.length <= 5) {
                            return `[${obj.map(item => JSON.stringify(item)).join(', ')}]`;
                          } else {
                            return `[\n${obj.map(item => 
                              spaces + '  ' + formatCompactJSON(item, indent + 1)
                            ).join(',\n')}\n${spaces}]`;
                          }
                        } else if (obj && typeof obj === 'object') {
                          const entries = Object.entries(obj);
                          return `{\n${entries.map(([key, value]) => 
                            `${spaces}  "${key}": ${formatCompactJSON(value, indent + 1)}`
                          ).join(',\n')}\n${spaces}}`;
                        } else {
                          return JSON.stringify(obj);
                        }
                      };
                      return formatCompactJSON(texture);
                    })()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Texture JSON Editor Modal */}
      {showJsonModal && editingTexture && (
        <JSONEditorModal
          isOpen={showJsonModal}
          onClose={() => {
            setShowJsonModal(false);
            setEditingTexture(null);
          }}
          onSave={handleJsonSave}
          jsonData={editingTexture}
          title={`Edit ${editingTexture.name} Properties`}
          hideSaveButton={true}
        />
      )}

      {/* Full Schema JSON Modal */}
      {showSchemaModal && (
        <JSONEditorModal
          isOpen={showSchemaModal}
          onClose={() => setShowSchemaModal(false)}
          jsonData={textures}
          title="FS25 Texture Schema"
        />
      )}

      {/* Save Schema Modal */}
      <SaveSchemaModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        schemaData={textures}
        schemaType="texture_schemas"
        onSaveSuccess={handleSaveSuccess}
      />
      </div>
    </div>
  );
}

export default TextureSchemaEditor;
