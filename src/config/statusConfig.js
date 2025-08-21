/**
 * Status configuration for UI components
 * Separates status types (behavior/color) from display text
 */

export const STATUS_TYPES = {
  IDLE: 'idle',
  PROCESSING: 'processing', 
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};

export const STATUS_CONFIG = {
  [STATUS_TYPES.IDLE]: {
    color: 'gray',
    bgColor: 'bg-gray-300',
    bgColorHex: 'rgb(209 213 219)', // gray-300
    description: 'Idle state'
  },
  [STATUS_TYPES.PROCESSING]: {
    color: 'blue',
    bgColor: 'bg-blue-500',
    bgColorHex: 'rgb(59 130 246)', // blue-500
    description: 'Processing state'
  },
  [STATUS_TYPES.SUCCESS]: {
    color: 'green',
    bgColor: 'bg-green-500', 
    bgColorHex: 'rgb(34 197 94)', // green-500
    description: 'Success state'
  },
  [STATUS_TYPES.ERROR]: {
    color: 'red',
    bgColor: 'bg-red-500',
    bgColorHex: 'rgb(239 68 68)', // red-500
    description: 'Error state'
  },
  [STATUS_TYPES.WARNING]: {
    color: 'yellow',
    bgColor: 'bg-yellow-500',
    bgColorHex: 'rgb(234 179 8)', // yellow-500
    description: 'Warning state'
  }
};

/**
 * Get status configuration by type
 * @param {string} statusType - Status type from STATUS_TYPES
 * @returns {object} - Status configuration object
 */
export function getStatusConfig(statusType) {
  return STATUS_CONFIG[statusType] || STATUS_CONFIG[STATUS_TYPES.IDLE];
}

/**
 * Check if status type represents a completed/successful state
 * @param {string} statusType - Status type to check
 * @returns {boolean} - True if status represents completion
 */
export function isCompletedStatus(statusType) {
  return statusType === STATUS_TYPES.SUCCESS;
}

/**
 * Check if status type represents an error state
 * @param {string} statusType - Status type to check
 * @returns {boolean} - True if status represents an error
 */
export function isErrorStatus(statusType) {
  return statusType === STATUS_TYPES.ERROR;
}

/**
 * Check if status type represents a processing state
 * @param {string} statusType - Status type to check
 * @returns {boolean} - True if status represents processing
 */
export function isProcessingStatus(statusType) {
  return statusType === STATUS_TYPES.PROCESSING;
}
