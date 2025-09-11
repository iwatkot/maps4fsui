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
      available: true
    },
    {
      id: 'texture',
      label: 'Texture Schema',
      icon: '🖼️',
      available: false // Will be implemented later
    }
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeSchemaType === 'tree' && (
          <TreeSchemaEditor onSchemaTypeChange={setActiveSchemaType} />
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
