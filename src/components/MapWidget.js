'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Helper function to calculate rotated rectangle corners
const getRotatedRectangleCorners = (centerLat, centerLon, sizeMeters, rotationDegrees) => {
  // Convert size from meters to approximate degrees
  // 1 degree lat ≈ 111,111 meters
  // 1 degree lon ≈ 111,111 * cos(lat) meters
  const halfSizeLat = (sizeMeters / 2) / 111111;
  const halfSizeLon = (sizeMeters / 2) / (111111 * Math.cos(centerLat * Math.PI / 180));
  
  // Convert rotation to radians
  const rotationRad = (rotationDegrees * Math.PI) / 180;
  
  // Define rectangle corners (before rotation)
  const corners = [
    [-halfSizeLat, -halfSizeLon], // bottom-left
    [-halfSizeLat, halfSizeLon],  // bottom-right
    [halfSizeLat, halfSizeLon],   // top-right
    [halfSizeLat, -halfSizeLon]   // top-left
  ];
  
  // Apply rotation and translate to center
  const rotatedCorners = corners.map(([lat, lon]) => {
    const rotatedLat = lat * Math.cos(rotationRad) - lon * Math.sin(rotationRad);
    const rotatedLon = lat * Math.sin(rotationRad) + lon * Math.cos(rotationRad);
    return [centerLat + rotatedLat, centerLon + rotatedLon];
  });
  
  return rotatedCorners;
};

// Create the actual map component
const ActualMapWidget = dynamic(() => {
  return import('react-leaflet').then((mod) => {
    const { MapContainer, TileLayer, Polygon, LayersControl, useMap, useMapEvents } = mod;
    
    // Internal component that uses Leaflet hooks
    function MapContent({ coordinates, onCoordinatesChange, size, rotation }) {
      const [isDragging, setIsDragging] = useState(false);
      
      // Parse coordinates
      const parseCoordinates = (coordString) => {
        if (!coordString) return { lat: 51.505, lon: -0.09 }; // Default to London
        
        const parts = coordString.trim().split(/[,\s]+/).filter(part => part.length > 0);
        if (parts.length === 2) {
          const lat = parseFloat(parts[0]);
          const lon = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lon)) {
            return { lat, lon };
          }
        }
        return { lat: 51.505, lon: -0.09 };
      };
      
      const { lat: centerLat, lon: centerLon } = parseCoordinates(coordinates);
      const rectangleCorners = getRotatedRectangleCorners(centerLat, centerLon, size, rotation);
      
      // Handle coordinate updates
      const handleCenterChange = (newLat, newLon) => {
        const formattedCoords = `${newLat.toFixed(6)}, ${newLon.toFixed(6)}`;
        onCoordinatesChange(formattedCoords);
      };
      
      // Map event handler
      const map = useMap();
      
      useMapEvents({
        click: (e) => {
          const { lat, lng } = e.latlng;
          handleCenterChange(lat, lng);
        }
      });
      
      // Update map view when coordinates change from form
      useEffect(() => {
        if (centerLat && centerLon && !isNaN(centerLat) && !isNaN(centerLon)) {
          map.setView([centerLat, centerLon], map.getZoom());
        }
      }, [centerLat, centerLon, map]);
      
      return (
        <>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                url="https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          <Polygon
            positions={rectangleCorners}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.3,
              weight: 2
            }}
          />
        </>
      );
    }
    
    // Return the component that will be dynamically loaded
    function DynamicMapComponent({ coordinates, onCoordinatesChange, size, rotation }) {
      // Parse coordinates for initial center
      const parseCoordinates = (coordString) => {
        if (!coordString) return { lat: 51.505, lon: -0.09 };
        
        const parts = coordString.trim().split(/[,\s]+/).filter(part => part.length > 0);
        if (parts.length === 2) {
          const lat = parseFloat(parts[0]);
          const lon = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lon)) {
            return { lat, lon };
          }
        }
        return { lat: 51.505, lon: -0.09 };
      };
      
      const { lat: centerLat, lon: centerLon } = parseCoordinates(coordinates);
      
      useEffect(() => {
        // Fix for default markers in Leaflet with Next.js
        if (typeof window !== 'undefined') {
          const L = require('leaflet');
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          });
        }
      }, []);
      
      return (
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <MapContent 
            coordinates={coordinates}
            onCoordinatesChange={onCoordinatesChange}
            size={size}
            rotation={rotation}
          />
        </MapContainer>
      );
    }
    
    return DynamicMapComponent;
  });
}, { ssr: false });

export default function MapWidget({ 
  coordinates, 
  onCoordinatesChange, 
  size = 2048, 
  rotation = 0 
}) {
  const [mounted, setMounted] = useState(false);
  
  // Fix for SSR
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-lg">
      <ActualMapWidget 
        coordinates={coordinates}
        onCoordinatesChange={onCoordinatesChange}
        size={size}
        rotation={rotation}
      />
    </div>
  );
}
