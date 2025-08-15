'use client';

import { useState } from 'react';

export default function Tooltip({ text, children, className = "", showTooltip = true }) {
  const [isHovering, setIsHovering] = useState(false);

  if (!text || !showTooltip) {
    return children;
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {children}
      </div>
      {isHovering && (
        <div className="absolute top-0 left-full ml-2 px-3 py-2 panel-backdrop text-xs z-50 w-64 tooltip-popup whitespace-normal">
          <span className="text-gray-800 dark:text-gray-200 block">{text}</span>
        </div>
      )}
    </div>
  );
}
