'use client';

/**
 * Sticky Footer component - Shows copyright, license, and main site link
 * Compact design to preserve screen space
 */
export default function StickyFooter() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {/* Left side - Copyright */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/iwatkot/maps4fs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
            >
              © iwatkot 2025
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              href="https://maps4fs.gitbook.io/docs/legal-information/license-info"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              CC BY-NC 4.0
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              href="https://maps4fs.gitbook.io/docs/legal-information/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Terms of Use
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              href="https://maps4fs.gitbook.io/docs/legal-information/official-sources"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-orange-500 dark:text-orange-400"
            >
              Official Sources & Risks
            </a>
          </div>

          {/* Right side - Main sites and contact */}
          <div className="flex items-center space-x-2">
            <a
              href="mailto:contact@maps4fs.xyz"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              contact@maps4fs.xyz
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              href="https://maps4fs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              maps4fs.xyz
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              href="https://atlasfs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
            >
              atlasfs.xyz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}