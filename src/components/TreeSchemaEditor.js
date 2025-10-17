'use client';

import { useState, useEffect, useCallback } from 'react';
import JSONEditorModal from '@/components/JSONEditorModal';
import SaveSchemaModal from '@/components/SaveSchemaModal';
import SelectorCompact from '@/components/SelectorCompact';
import { getTreeSchema } from '../api/schemas';
import config from '@/app/config.js';

// Hardcoded tree data (keep this for images)
const TREE_DATA = {
  "americanElm_stage01": "https://github.com/user-attachments/assets/eb1857dd-47b7-4883-83fa-385fefad101c",
  "americanElm_stage02": "https://github.com/user-attachments/assets/7688fd89-a006-4023-8c56-c3e4291d5357",
  "americanElm_stage03": "https://github.com/user-attachments/assets/298729cb-809f-4d1e-bdbc-945dfd45a365",
  "americanElm_stage04": "https://github.com/user-attachments/assets/c07e0d90-742b-4f9e-8799-71cc6a50f19d",
  "americanElm_stage05": "https://github.com/user-attachments/assets/a2a1943d-6ddb-4496-9526-58919cdecdd4",
  "apple_stage03": "https://github.com/user-attachments/assets/bbda1ccb-46a2-489c-b93d-ea51ce13683d",
  "aspen_stage01": "https://github.com/user-attachments/assets/d53ae74c-6971-4547-bd65-cf6cd75180c3",
  "aspen_stage02": "https://github.com/user-attachments/assets/e148daf8-066f-4a6f-be13-2838c632afce",
  "aspen_stage03": "https://github.com/user-attachments/assets/f11e6843-30d2-4727-a96d-3599ee53eef3",
  "aspen_stage04": "https://github.com/user-attachments/assets/157d0298-9893-487a-8598-bbbe5d8cc623",
  "aspen_stage05": "https://github.com/user-attachments/assets/9031ee5e-598d-40c5-8237-dd9f8e74bd69",
  "aspen_stage06_var01": "https://github.com/user-attachments/assets/68b71344-a069-46b3-b977-c454120efea4",
  "aspen_stage06_var02": "https://github.com/user-attachments/assets/d4c942fb-29d8-46d7-9798-f40fe3895403",
  "beech_stage01": "https://github.com/user-attachments/assets/c5b7e07d-eaf4-43f1-81d6-8b3641914e29",
  "beech_stage02": "https://github.com/user-attachments/assets/15781495-d41d-4b34-9c96-2e0d365b82f0",
  "beech_stage02_var02": "https://github.com/user-attachments/assets/1711ccf1-b41b-4152-bb62-48e98d8fe9b1",
  "beech_stage02_var03": "https://github.com/user-attachments/assets/f9168063-77a7-43e6-9469-add6349eaeed",
  "beech_stage03": "https://github.com/user-attachments/assets/c1b350c6-e98d-4ea6-929b-f43288147faa",
  "beech_stage04": "https://github.com/user-attachments/assets/578d7e8a-3a26-4651-90c3-1297431a9574",
  "beech_stage05": "https://github.com/user-attachments/assets/e827d20d-1138-47d3-b0fb-6c33f3882fe4",
  "beech_stage06_var01": "https://github.com/user-attachments/assets/f9681fdb-d10f-43d5-8c5e-33e4b46c54f2",
  "beech_stage06_var02": "https://github.com/user-attachments/assets/aaf1e2f2-7668-459b-b1ed-2cafb99baa6d",
  "betulaErmanii_stage01": "https://github.com/user-attachments/assets/fe8455e1-605d-4eff-8f64-ce0b25f05e7a",
  "betulaErmanii_stage02": "https://github.com/user-attachments/assets/998cc3ec-080d-4afa-90b9-31e481aa8f43",
  "betulaErmanii_stage03": "https://github.com/user-attachments/assets/47b6ba66-62dd-4932-9267-40d9a6c33c1c",
  "betulaErmanii_stage04": "https://github.com/user-attachments/assets/198b7c91-f95a-49be-a693-1b2c6a4110d6",
  "boxelder_stage01": "https://github.com/user-attachments/assets/d97a9459-0936-4aaf-ae94-6dcbc9eab301",
  "boxelder_stage02": "https://github.com/user-attachments/assets/7580d048-8789-42a7-a611-313f932b4751",
  "boxelder_stage03": "https://github.com/user-attachments/assets/9d32deff-204d-434b-b5b3-3ef8bb4f31aa",
  "cherry_stage01": "https://github.com/user-attachments/assets/9665a9b0-f68c-47cb-80b3-c08e6f148b30",
  "cherry_stage02": "https://github.com/user-attachments/assets/eda62d03-08c9-446e-ba17-798476ebc0aa",
  "cherry_stage03": "https://github.com/user-attachments/assets/555ebf25-3333-440a-aa31-7cc46f9429c0",
  "cherry_stage04": "https://github.com/user-attachments/assets/b04e2f10-502c-4ae7-a618-0351cc116f5a",
  "chineseElm_stage01": "https://github.com/user-attachments/assets/5927c18f-af18-4e2c-80eb-ba23e8d120f2",
  "chineseElm_stage02": "https://github.com/user-attachments/assets/dc04f2fe-f962-4d2d-b8e0-9867adf50443",
  "chineseElm_stage03": "https://github.com/user-attachments/assets/0aca52f0-cea6-45f7-ace6-d5a4150ab232",
  "chineseElm_stage04": "https://github.com/user-attachments/assets/d5d89e6c-2158-4362-9a7f-88bf44b43aa8",
  "deadwood": "https://github.com/user-attachments/assets/0095a837-a674-4398-a2e5-28fa132319a9",
  "downyServiceBerry_stage01": "https://github.com/user-attachments/assets/83005db3-eae5-4af3-9d97-ceb8a450afa7",
  "downyServiceBerry_stage02": "https://github.com/user-attachments/assets/aaf30d40-765b-463f-b20e-63a2cae05e01",
  "downyServiceBerry_stage03": "https://github.com/user-attachments/assets/4a52742f-e0b0-47e5-99af-41fcdac15d38",
  "goldenRain_stage01": "https://github.com/user-attachments/assets/54241e46-2382-4d84-877e-e9aa89d70c4b",
  "goldenRain_stage02": "https://github.com/user-attachments/assets/e5e0394d-2815-42d7-82fc-438b07718eb9",
  "goldenRain_stage03": "https://github.com/user-attachments/assets/f49311b6-89bd-4ea7-8e34-7e419f388493",
  "goldenRain_stage04": "https://github.com/user-attachments/assets/61d3d405-a34b-4dbc-9317-8f4a00b389e9",
  "japaneseZelkova_stage01": "https://github.com/user-attachments/assets/f77c4590-e1ce-4b85-beb6-8fc99fb5869a",
  "japaneseZelkova_stage02": "https://github.com/user-attachments/assets/3c69ae5f-b0de-42bf-b9b4-948f416d1b17",
  "japaneseZelkova_stage03": "https://github.com/user-attachments/assets/c106212f-9831-4d02-9b00-21fd7bf89eee",
  "japaneseZelkova_stage04": "https://github.com/user-attachments/assets/3288d14a-e7b5-4e0c-9a67-ab40c3da267f",
  "lodgepolePine_stage01": "https://github.com/user-attachments/assets/6ea5cd22-42ea-4409-bbf5-243dd2a3ca1a",
  "lodgepolePine_stage02": "https://github.com/user-attachments/assets/fcfa25ad-9c4a-4b4b-8952-076a20a54621",
  "lodgepolePine_stage02Var2": "https://github.com/user-attachments/assets/b54dda48-af54-45e3-a048-3879f3e38681",
  "lodgepolePine_stage03": "https://github.com/user-attachments/assets/9699c98f-ec94-457d-b567-9d61adc99808",
  "lodgepolePine_stage03Var2": "https://github.com/user-attachments/assets/b947361f-ab52-4ce0-b3f9-f0dfecb45517",
  "northernCatalpa_stage01": "https://github.com/user-attachments/assets/c2d95dd3-badb-4d20-ba8c-e1963ce3af10",
  "northernCatalpa_stage02": "https://github.com/user-attachments/assets/91922759-21d8-408d-925f-4f569e8489a3",
  "northernCatalpa_stage03": "https://github.com/user-attachments/assets/e232a83a-6268-43db-869a-8093ccdc74a4",
  "northernCatalpa_stage04": "https://github.com/user-attachments/assets/7c1fa393-93e9-433b-8c1d-93336949c8cc",
  "oak_stage01": "https://github.com/user-attachments/assets/d89a718f-7267-4c89-89ca-8e3cf0dbb89f",
  "oak_stage02": "https://github.com/user-attachments/assets/65650e12-ff6f-4150-bf33-4e0973dbf1f8",
  "oak_stage03": "https://github.com/user-attachments/assets/16e99c5f-474d-4b33-b84e-cadc27a42b65",
  "oak_stage04": "https://github.com/user-attachments/assets/f7ead2b9-4764-4121-a835-a4338bdb0807",
  "oak_stage05": "https://github.com/user-attachments/assets/5e28c082-36fb-4eb2-9c9f-af88da9dc188",
  "pinusSylvestris_stage01": "https://github.com/user-attachments/assets/791b15ad-e8d1-4799-9787-3e4818f87a68",
  "pinusSylvestris_stage02": "https://github.com/user-attachments/assets/23c6c0f5-5d1b-49aa-ad57-1ac657a6f1e5",
  "pinusSylvestris_stage03": "https://github.com/user-attachments/assets/94618c71-9d70-4608-9a4b-828cc15d0d70",
  "pinusSylvestris_stage04": "https://github.com/user-attachments/assets/9f91cd22-0f15-482b-a1ad-346589bf6691",
  "pinusSylvestris_stage05": "https://github.com/user-attachments/assets/d7b0bdd5-6d36-4f8d-8692-9ac217ac8f41",
  "pinusTabuliformis_stage01": "https://github.com/user-attachments/assets/fb884c92-8f06-43ed-bde8-769a071dc1a8",
  "pinusTabuliformis_stage02": "https://github.com/user-attachments/assets/2cdf2419-41fd-4c40-9428-04b620dbf29f",
  "pinusTabuliformis_stage03": "https://github.com/user-attachments/assets/c36884b4-d3c0-4af5-a9cb-506e4ff8a389",
  "pinusTabuliformis_stage04": "https://github.com/user-attachments/assets/20f795ed-4ae4-4ff6-8f47-7a1470cd8202",
  "pinusTabuliformis_stage05": "https://github.com/user-attachments/assets/40ded4f7-cf96-4b16-be42-b2d727ad2fab",
  "shagbarkHickory_stage01": "https://github.com/user-attachments/assets/80e21d92-6233-4126-b1e3-d5492650c750",
  "shagbarkHickory_stage02": "https://github.com/user-attachments/assets/acf77d66-6798-436e-bc1f-86757276f2bf",
  "shagbarkHickory_stage03": "https://github.com/user-attachments/assets/9735c5db-3478-41a9-a3ec-e7c15fe10559",
  "shagbarkHickory_stage04": "https://github.com/user-attachments/assets/82a8fc7e-92dc-4936-b201-c1e7a5ec915a",
  "tiliaAmurensis_stage01": "https://github.com/user-attachments/assets/105f3e6f-b25e-4918-b93b-5c45d382f14f",
  "tiliaAmurensis_stage02": "https://github.com/user-attachments/assets/2e3ad498-2d86-434b-89ca-84463ae620d1",
  "tiliaAmurensis_stage03": "https://github.com/user-attachments/assets/87993bde-36bf-45aa-b482-2b8288d0cf47",
  "tiliaAmurensis_stage04": "https://github.com/user-attachments/assets/06296049-7ce1-4aef-93bc-50e307c36062",
  "treesRavaged": "https://github.com/user-attachments/assets/5718f33d-2893-48bb-9029-c011dd8ef241"
};

const TreeSchemaEditor = ({ activeSchemaType, onSchemaTypeChange }) => {
  const [selectedTrees, setSelectedTrees] = useState(new Set());
  const [showJSONModal, setShowJSONModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'broadleaved', 'needleleaved', 'other'
  const [treeSchema, setTreeSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tree schema from API
  const fetchTreeSchema = useCallback(async (version = 'fs25') => {
    setLoading(true);
    setError(null);
    
    try {
      const trees = await getTreeSchema(version);
      setTreeSchema(trees);
      // Initialize with all trees selected
      const allTreeNames = new Set(trees.map(tree => tree.name));
      setSelectedTrees(allTreeNames);
    } catch (err) {
      setError('Failed to load tree schema: ' + err.message);
      setTreeSchema([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize with FS25 tree schema
  useEffect(() => {
    fetchTreeSchema('fs25');
  }, [fetchTreeSchema]);

  // Filter trees based on search and type
  const filteredTrees = treeSchema.filter(tree => {
    const matchesSearch = tree.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
                       (filterType === 'other' && !tree.leaf_type) ||
                       tree.leaf_type === filterType;
    return matchesSearch && matchesType;
  });

  // Group trees by base name for better organization
  const groupedTrees = filteredTrees.reduce((groups, tree) => {
    const baseName = tree.name.split('_stage')[0].split('_var')[0];
    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push(tree);
    return groups;
  }, {});

  const toggleTree = useCallback((treeName) => {
    setSelectedTrees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(treeName)) {
        newSet.delete(treeName);
      } else {
        newSet.add(treeName);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allTreeNames = new Set(treeSchema.map(tree => tree.name));
    setSelectedTrees(allTreeNames);
  }, [treeSchema]);

  const deselectAll = useCallback(() => {
    setSelectedTrees(new Set());
  }, []);

  const generateSchema = useCallback(() => {
    return treeSchema.filter(tree => selectedTrees.has(tree.name));
  }, [selectedTrees, treeSchema]);

  const handleShowJSON = () => {
    setShowJSONModal(true);
  };

  const handleSaveSchema = () => {
    setShowSaveModal(true);
  };

  const handleSaveSuccess = (result) => {
    console.log('Schema saved successfully:', result);
    // You can add a toast notification here if desired
  };

  const formatTreeName = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  const getLeafTypeIcon = (leafType) => {
    if (leafType === 'broadleaved') return '🍃';
    if (leafType === 'needleleaved') return '🌲';
    return '🪵';
  };

  const getLeafTypeColor = (leafType) => {
    if (leafType === 'broadleaved') return 'text-green-600 dark:text-green-400';
    if (leafType === 'needleleaved') return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };

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
                placeholder="Search trees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i className="zmdi zmdi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            {/* Filter by type */}
            <SelectorCompact
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'broadleaved', label: '🍃 Broadleaved' },
                { value: 'needleleaved', label: '🌲 Needleleaved' },
                { value: 'other', label: '🪵 Other' }
              ]}
              value={filterType}
              onChange={setFilterType}
              className="min-w-[160px]"
            />

            {/* Selection info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTrees.size} / {treeSchema.length} trees selected
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={selectAll}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <i className="zmdi zmdi-check-all mr-2"></i>
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <i className="zmdi zmdi-close mr-2"></i>
              Deselect All
            </button>
            <button
              onClick={handleShowJSON}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <i className="zmdi zmdi-code mr-2"></i>
              Show Schema
            </button>
            {!config.isPublicVersion && (
              <button
                onClick={handleSaveSchema}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
              >
                <i className="zmdi zmdi-save mr-2"></i>
                Save Schema
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tree Grid */}
      <div className="flex-1 overflow-auto px-6 py-4 bg-gray-50 dark:bg-gray-900">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading tree schema...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <i className="zmdi zmdi-alert-triangle text-red-500 mr-3 mt-1"></i>
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">
                  Failed to load tree schema
                </h3>
                <p className="text-red-700 dark:text-red-400 text-sm mb-3">{error}</p>
                <button
                  onClick={() => fetchTreeSchema('fs25')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && Object.entries(groupedTrees).map(([baseName, trees]) => (
            <div key={baseName} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                {getLeafTypeIcon(trees[0].leaf_type)}
                <span className="ml-2">{formatTreeName(baseName)}</span>
                <span className={`ml-2 text-sm ${getLeafTypeColor(trees[0].leaf_type)}`}>
                  ({trees[0].leaf_type || 'other'})
                </span>
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {trees.map((tree) => {
                  const isSelected = selectedTrees.has(tree.name);
                  const imageUrl = TREE_DATA[tree.name];
                  
                  return (
                    <div
                      key={tree.name}
                      onClick={() => toggleTree(tree.name)}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <i className="zmdi zmdi-check text-xs"></i>}
                      </div>

                      {/* Tree image */}
                      <div className="aspect-square p-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={tree.name}
                            className="w-full h-full object-contain rounded"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                            <span className="text-4xl">{getLeafTypeIcon(tree.leaf_type)}</span>
                          </div>
                        )}
                      </div>

                      {/* Tree info */}
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">
                          {formatTreeName(tree.name)}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>ID: {tree.reference_id}</span>
                          <span className={getLeafTypeColor(tree.leaf_type)}>
                            {getLeafTypeIcon(tree.leaf_type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {!loading && !error && Object.keys(groupedTrees).length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              No trees found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filter settings.
            </p>
          </div>
        )}
      </div>

      {/* JSON Modal */}
      <JSONEditorModal
        isOpen={showJSONModal}
        onClose={() => setShowJSONModal(false)}
        jsonData={generateSchema()}
        title="FS25 Tree Schema"
      />

      {/* Save Schema Modal */}
      <SaveSchemaModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        schemaData={generateSchema()}
        schemaType="tree_schemas"
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default TreeSchemaEditor;
