'use client';

import { useState } from 'react';

export default function Tooltip({ text, children, className = "" }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!text) {
    return children;
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute top-0 left-full ml-2 px-3 py-2 panel-backdrop text-xs z-50 w-64 tooltip-popup whitespace-normal">
          <span className="text-gray-800 dark:text-gray-200 block">{text}</span>
        </div>
      )}
    </div>
  );
}
