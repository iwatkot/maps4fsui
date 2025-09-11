'use client';

import { useState } from 'react';
import TreeSchemaEditor from '@/components/TreeSchemaEditor';

const SchemasTab = () => {
  const [activeSchemaType, setActiveSchemaType] = useState('tree');

  const schemaTypes = [
    {
      id: 'tree',
      label: 'Tree Schema',
      icon: '🌳',
      available: true,
      supportedVersions: ['FS25']
    },
    {
      id: 'texture',
      label: 'Texture Schema',
      icon: '🖼️',
      available: false, // Will be implemented later
      supportedVersions: ['FS22', 'FS25']
    }
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <span className="mr-3 text-3xl">🗂️</span>
            Schemas Editor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and customize schemas for trees and textures to control what appears in your generated maps.
          </p>
        </div>
      </div>

      {/* Schema Type Selector */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-4">
            {schemaTypes.map((schemaType) => (
              <button
                key={schemaType.id}
                onClick={() => schemaType.available && setActiveSchemaType(schemaType.id)}
                disabled={!schemaType.available}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  !schemaType.available
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-600'
                    : activeSchemaType === schemaType.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <span className="mr-3 text-xl">{schemaType.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{schemaType.label}</div>
                  <div className="text-xs opacity-75">
                    {schemaType.supportedVersions.join(', ')}
                    {!schemaType.available && ' (Coming Soon)'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeSchemaType === 'tree' && (
          <TreeSchemaEditor />
        )}
        {activeSchemaType === 'texture' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <span className="text-6xl block mb-4">🚧</span>
              <h3 className="text-xl font-medium mb-2">Texture Schema Editor</h3>
              <p>Coming soon! This feature is currently under development.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemasTab;
