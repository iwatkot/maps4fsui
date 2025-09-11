'use client';

import { useState } from 'react';
import TreeSchemaEditor from '@/components/TreeSchemaEditor';
import TextureSchemaEditor from '@/components/TextureSchemaEditor';

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
      available: true
    }
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeSchemaType === 'tree' && (
          <TreeSchemaEditor 
            activeSchemaType={activeSchemaType}
            onSchemaTypeChange={setActiveSchemaType} 
          />
        )}
        {activeSchemaType === 'texture' && (
          <TextureSchemaEditor 
            activeSchemaType={activeSchemaType}
            onSchemaTypeChange={setActiveSchemaType} 
          />
        )}
      </div>
    </div>
  );
};

export default SchemasTab;
