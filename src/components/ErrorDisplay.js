'use client';

export default function ErrorDisplay({ 
  error, 
  title = "Error",
  className = ""
}) {
  if (!error) return null;

  return (
    <div className={`mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
      <p className="text-sm text-red-600 dark:text-red-400">
        {title && <strong>{title}:</strong>} {error.message || error}
      </p>
    </div>
  );
}
