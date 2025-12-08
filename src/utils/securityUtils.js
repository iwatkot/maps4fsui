/**
 * Security utilities for file operations
 */

import path from 'path';
import securityLogger from './securityLogger';

/**
 * Validate filename to prevent path traversal and command injection
 * @param {string} filename - Filename to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return false;
  }

  // Disallow path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Disallow null bytes (can be used for injection)
  if (filename.includes('\0')) {
    return false;
  }

  // Only allow alphanumeric, dash, underscore, and dot
  // This prevents command injection and special shell characters
  const safeFilenameRegex = /^[a-zA-Z0-9_\-\.]+$/;
  if (!safeFilenameRegex.test(filename)) {
    return false;
  }

  // Prevent files starting with dot (hidden files)
  if (filename.startsWith('.')) {
    return false;
  }

  // Length check
  if (filename.length > 255) {
    return false;
  }

  return true;
}

/**
 * Validate directory path to prevent access to sensitive locations
 * @param {string} dirPath - Directory path to validate
 * @param {string[]} allowedBasePaths - List of allowed base directories
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidDirectory(dirPath, allowedBasePaths = []) {
  if (!dirPath || typeof dirPath !== 'string') {
    return false;
  }

  // Normalize the path to resolve any .. or . segments
  const normalizedPath = path.normalize(dirPath);

  // Disallow path traversal attempts
  if (normalizedPath.includes('..')) {
    return false;
  }

  // Disallow null bytes
  if (normalizedPath.includes('\0')) {
    return false;
  }

  // Block access to sensitive system directories
  const blockedPaths = [
    '/etc',
    '/bin',
    '/sbin',
    '/usr/bin',
    '/usr/sbin',
    '/boot',
    '/sys',
    '/proc',
    '/root',
    'C:\\Windows',
    'C:\\Program Files',
    'C:\\Program Files (x86)',
  ];

  for (const blockedPath of blockedPaths) {
    if (normalizedPath.startsWith(blockedPath)) {
      return false;
    }
  }

  // If allowed base paths are specified, ensure path is within them
  if (allowedBasePaths.length > 0) {
    const isWithinAllowedPath = allowedBasePaths.some(basePath => {
      const normalizedBase = path.normalize(basePath);
      return normalizedPath.startsWith(normalizedBase);
    });

    if (!isWithinAllowedPath) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize file path by resolving it and ensuring it's within allowed directory
 * @param {string} baseDir - Base directory (must be absolute)
 * @param {string} userPath - User-provided path component
 * @returns {string|null} - Sanitized absolute path or null if invalid
 */
export function sanitizeFilePath(baseDir, userPath) {
  if (!baseDir || !userPath) {
    return null;
  }

  // Resolve the path (this prevents traversal attacks)
  const resolvedPath = path.resolve(baseDir, userPath);
  
  // Ensure the resolved path is still within the base directory
  const normalizedBase = path.normalize(baseDir);
  const normalizedResolved = path.normalize(resolvedPath);
  
  if (!normalizedResolved.startsWith(normalizedBase)) {
    securityLogger.suspiciousActivity('Path traversal attempt', {
      userPath,
      baseDir,
      resolvedPath
    });
    return null;
  }
  
  return resolvedPath;
}

/**
 * Validate file content to prevent malicious uploads
 * @param {string} content - File content to validate
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {object} - { valid: boolean, reason?: string }
 */
export function validateFileContent(content, maxSize = 10 * 1024 * 1024) { // 10MB default
  if (typeof content !== 'string') {
    return { valid: false, reason: 'Content must be a string' };
  }

  // Size check
  const sizeInBytes = Buffer.byteLength(content, 'utf8');
  if (sizeInBytes > maxSize) {
    return { 
      valid: false, 
      reason: `Content too large: ${sizeInBytes} bytes (max: ${maxSize} bytes)` 
    };
  }

  // Check for suspicious content patterns
  const suspiciousPatterns = [
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /passthru\s*\(/i,
    /shell_exec\s*\(/i,
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      securityLogger.suspiciousActivity('Suspicious content pattern detected', {
        pattern: pattern.toString(),
        contentLength: content.length
      });
      // Don't block, just warn (this could be legitimate code)
      // return { valid: false, reason: 'Suspicious content detected' };
    }
  }   console.warn(`[SECURITY] Suspicious content pattern detected: ${pattern}`);
      // Don't block, just warn (this could be legitimate code)
      // return { valid: false, reason: 'Suspicious content detected' };
    }
  }

  return { valid: true };
}

/**
 * Get safe file extension
 * @param {string} filename - Filename to extract extension from
 * @returns {string|null} - Lowercase extension without dot, or null
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return null;
  }

  const ext = path.extname(filename).toLowerCase();
  return ext ? ext.substring(1) : null; // Remove the dot
}

/**
 * Check if file extension is allowed
 * @param {string} filename - Filename to check
 * @param {string[]} allowedExtensions - List of allowed extensions (without dot)
 * @returns {boolean} - True if allowed or no restriction, false otherwise
 */
export function isAllowedExtension(filename, allowedExtensions = []) {
  if (allowedExtensions.length === 0) {
    return true; // No restrictions
  }

  const ext = getFileExtension(filename);
  if (!ext) {
    return false;
  }

  return allowedExtensions.includes(ext);
}
