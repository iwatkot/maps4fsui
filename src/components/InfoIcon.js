'use client';

import Tooltip from './Tooltip';

export default function InfoIcon({ tooltip, showTooltip = true }) {
  if (!tooltip || !showTooltip) {
    return null;
  }

  return (
    <Tooltip text={tooltip} showTooltip={showTooltip}>
      <div className="w-4 h-4 rounded-full border border-gray-400 dark:border-gray-500 flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">?</span>
      </div>
    </Tooltip>
  );
}
