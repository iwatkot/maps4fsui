/**
 * Tabs component for navigation between different sections
 */

import { useState } from 'react';

const Tabs = ({ tabs, activeTab, onTabChange, rightContent }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
        
        {rightContent && (
          <div className="flex items-center space-x-4 py-4">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;
