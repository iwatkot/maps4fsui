// Form options and configurations for Maps4FS UI

export const gameOptions = [
  { 
    value: 'fs25', 
    label: 'Farming Simulator 25', 
    description: 'All features are supported.' 
  },
  { 
    value: 'fs22', 
    label: 'Farming Simulator 22', 
    description: 'Support discontinued, new features will not be added. Fields, trees and grass are not supported.'
  }
];

export const availableSizeOptions = [
  { value: 2048, label: '2048 x 2048 meters', description: '' },
  { value: 4096, label: '4096 x 4096 meters', description: '' },
  { value: 8192, label: '8192 x 8192 meters', description: '' },
  { value: 16384, label: '16384 x 16384 meters', description: '' },
  { value: "custom", label: "Custom Size", description: '' }
];

// DTM provider options
export const defaultDTMOption = { 
  value: 'srtm30', 
  label: '🌎 Global [30.0 m/px] SRTM 30 m', 
  description: '' 
};

// Default values for form inputs
export const defaultValues = {
  game: 'fs25',
  coordinates: '45.28571409289627, 20.237433441210115',
  size: 2048,
  customSize: 2048,
  outputSize: 2048,
  rotation: 0,
  dtmProvider: 'srtm30',
  option1: 20,
  option2: 10,
  exampleSwitch: false,
};

// Validation constraints
export const constraints = {
  coordinates: {
    minLat: -90,
    maxLat: 90,
    minLng: -180,
    maxLng: 180
  },
  customSize: {
    min: 512,
    max: 32768,
    step: 512
  },
  outputSize: {
    min: 512,
    max: 8192,
    step: 256
  },
  rotation: {
    min: 0,
    max: 359,
    step: 1
  },
};

// Helper function to create size options based on version
export const createSizeOptions = (isPublicVersion) => {
  if (isPublicVersion) {
    return [
      ...availableSizeOptions.slice(0, 2), // First two options enabled
      ...availableSizeOptions.slice(2).map(option => ({ // Rest disabled with info
        ...option,
        disabled: true,
        description: option.description || 'Available in local version only'
      }))
    ];
  }
  return availableSizeOptions;
};
