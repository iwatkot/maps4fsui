/**
 * MainTabs component - Main navigation header with button-style tabs
 */

const MainTabs = ({ tabs, activeTab, onTabChange, rightContent }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 min-h-[80px]">
      <div className="flex justify-between items-center px-8 py-4 h-full">
        <nav className="flex space-x-2" aria-label="Main Navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium text-base transition-colors duration-200 flex items-center min-h-[48px] ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md border border-gray-200 dark:border-gray-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white border border-transparent'
              }`}
            >
              {tab.icon && <span className="mr-3">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
        
        {rightContent && (
          <div className="flex items-center space-x-6">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainTabs;
