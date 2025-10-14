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
  coordinates: '', // Start with empty coordinates
  size: 2048,
  customSize: 2048,
  outputSize: 2048,
  rotation: 0,
  dtmProvider: 'srtm30',
  // DEM Settings.
  blurRadius: 3,
  waterDepth: 0,
  addFoundations: false,
  plateau: 0,
  ceiling: 0,
  // Background Settings.
  generateBackground: false,
  generateWater: false,
  waterBlurriness: 0,
  removeCenter: true,
  flattenRoads: false,
  flattenWater: false,
  // GRLE Settings.
  farmlandMargin: 5,
  addGrass: true,
  randomPlants: true,
  baseGrass: "smallDenseMix",
  addFarmyards: false,
  basePrice: 60000,
  // I3D Settings.
  addTrees: true,
  forestDensity: 10,
  treeLimit: 0,
  treesRelativeShift: 20,
  splineDensity: 2,
  // Texture Settings.
  fieldsPadding: 0,
  dissolve: false,
  skipDrains: false,
  useCache: true,
  usePreciseTags: false,
  // Satellite Settings.
  downloadImages: false,
  zoomLevel: 16,
};

// Validation constraints
export const constraints = {
  coordinates: {
    minLat: -90,
    maxLat: 90,
    minLng: -180,
    maxLng: 180
  },
  rotation: {
    min: -90,
    max: 90,
  },
  // DEM settings.
  blurRadius: {
    min: 0,
    max: 100,
  },
  waterDepth: {
    min: 0,
    max: 50,
  },
  plateau: {
    min: 0,
    max: 100,
  },
  ceiling: {
    min: 0,
    max: 100,
  },
  // Background settings.
  waterBlurriness: {
    min: 0,
    max: 100,
  },
  // GRLE settings.
  farmlandMargin: {
    min: 0,
    max: 100,
  },
  basePrice: {
    min: 0,
    max: 1000000,
  },
  // I3D settings.
  forestDensity: {
    min: 0,
    max: 100,
  },
  treeLimit: {
    min: 0,
    max: 100000,
  },
  // Texture settings.
  fieldsPadding: {
    min: 0,
    max: 30,
  },
  // Satellite settings.
  zoomLevel: {
    min: 14,
    max: 18,
  },
};

// Helper function to create size options based on version
export const createSizeOptions = (isPublicVersion) => {
  if (isPublicVersion) {
    return [
      ...availableSizeOptions.slice(0, 3), // First three options enabled
      ...availableSizeOptions.slice(3).map(option => ({ // Rest disabled with info
        ...option,
        disabled: true,
        description: option.description || 'Available in local version only'
      }))
    ];
  }
  return availableSizeOptions;
};
