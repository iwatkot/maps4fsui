'use client';

/**
 * Utility functions for processing OSM files for map display
 */

// Function to read file as text
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// Function to convert OSM XML to GeoJSON
export const osmToGeoJson = async (osmXmlString) => {
  try {
    // Dynamic import to avoid SSR issues
    const osmtogeojson = (await import('osmtogeojson')).default;
    
    // Parse XML string to DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(osmXmlString, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML format');
    }
    
    // Convert to GeoJSON
    const geoJson = osmtogeojson(xmlDoc, {
      flatProperties: true,
      uninterestingTags: {
        'source': true,
        'source_ref': true,
        'source:*': true,
        'history': true,
        'attribution': true,
        'created_by': true,
        'tiger:*': true,
        'gnis:*': true
      }
    });
    
    return geoJson;
  } catch (error) {
    console.error('Error converting OSM to GeoJSON:', error);
    throw new Error(`Failed to convert OSM data: ${error.message}`);
  }
};

// Function to process OSM file and return GeoJSON
export const processOsmFile = async (file) => {
  try {
    const osmXmlString = await readFileAsText(file);
    const geoJson = await osmToGeoJson(osmXmlString);
    
    // Basic validation
    if (!geoJson || !geoJson.features) {
      throw new Error('Invalid GeoJSON output');
    }
    
    return {
      geoJson,
      bounds: calculateBounds(geoJson),
      featureCount: geoJson.features.length,
      originalXml: osmXmlString // Store original XML for API calls
    };
  } catch (error) {
    console.error('Error processing OSM file:', error);
    throw error;
  }
};

// Function to calculate bounds from GeoJSON
export const calculateBounds = (geoJson) => {
  if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
    return null;
  }
  
  let minLat = Infinity, minLon = Infinity;
  let maxLat = -Infinity, maxLon = -Infinity;
  
  geoJson.features.forEach(feature => {
    const geometry = feature.geometry;
    if (!geometry || !geometry.coordinates) return;
    
    const processCoordinates = (coords) => {
      if (typeof coords[0] === 'number') {
        // Single coordinate pair [lon, lat]
        const [lon, lat] = coords;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
      } else {
        // Array of coordinates
        coords.forEach(processCoordinates);
      }
    };
    
    processCoordinates(geometry.coordinates);
  });
  
  if (minLat === Infinity) return null;
  
  return {
    southwest: [minLat, minLon],
    northeast: [maxLat, maxLon],
    center: [(minLat + maxLat) / 2, (minLon + maxLon) / 2]
  };
};

// Function to get style for different OSM features
export const getFeatureStyle = (feature) => {
  const properties = feature.properties || {};
  const geometry = feature.geometry;
  
  // Default styles
  let style = {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.3
  };
  
  // Roads and paths
  if (properties.highway) {
    const highway = properties.highway;
    if (['motorway', 'trunk', 'primary'].includes(highway)) {
      return { ...style, color: '#e74c3c', weight: 3 };
    } else if (['secondary', 'tertiary'].includes(highway)) {
      return { ...style, color: '#f39c12', weight: 2 };
    } else if (['residential', 'unclassified', 'service'].includes(highway)) {
      return { ...style, color: '#95a5a6', weight: 1 };
    } else if (['footway', 'path', 'track'].includes(highway)) {
      return { ...style, color: '#8e44ad', weight: 1, dashArray: '5, 5' };
    }
    return { ...style, color: '#34495e', weight: 1 };
  }
  
  // Buildings
  if (properties.building) {
    return { 
      ...style, 
      color: '#2c3e50', 
      fillColor: '#ecf0f1', 
      weight: 1,
      fillOpacity: 0.7 
    };
  }
  
  // Water features
  if (properties.natural === 'water' || properties.waterway) {
    return { 
      ...style, 
      color: '#3498db', 
      fillColor: '#85c1e9', 
      weight: 1,
      fillOpacity: 0.6 
    };
  }
  
  // Landuse
  if (properties.landuse) {
    const landuse = properties.landuse;
    if (['forest', 'wood'].includes(landuse)) {
      return { ...style, color: '#27ae60', fillColor: '#58d68d', fillOpacity: 0.4 };
    } else if (['farmland', 'meadow', 'grass'].includes(landuse)) {
      return { ...style, color: '#2ecc71', fillColor: '#7dcea0', fillOpacity: 0.3 };
    } else if (['residential', 'commercial', 'industrial'].includes(landuse)) {
      return { ...style, color: '#95a5a6', fillColor: '#d5dbdb', fillOpacity: 0.3 };
    }
  }
  
  // Points of interest
  if (geometry.type === 'Point') {
    return {
      radius: 4,
      fillColor: '#e67e22',
      color: '#d35400',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
  }
  
  // Default style
  return { ...style, color: '#7f8c8d', fillColor: '#bdc3c7' };
};
