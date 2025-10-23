'use client';

export default function SimpleButton({ 
  children, 
  onClick, 
  variant = "primary", 
  disabled = false,
  className = "",
  type = "button"
}) {
  const getVariantClasses = () => {
    switch(variant) {
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${getVariantClasses()} ${className}`}
    >
      {children}
    </button>
  );
}