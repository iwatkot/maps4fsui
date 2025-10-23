'use client';

export default function SimpleRadio({ 
  name, 
  options, 
  selectedValue, 
  onChange, 
  label = "",
  required = false 
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 appearance-none rounded-full border-2 checked:bg-blue-600 checked:border-blue-600 relative checked:after:content-[''] checked:after:absolute checked:after:top-[2px] checked:after:left-[2px] checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full"
            />
            <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}