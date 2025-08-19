'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Helper function to calculate rotated rectangle corners
const getRotatedRectangleCorners = (centerLat, centerLon, sizeMeters, rotationDegrees) => {
  const corners = [];
  const half_diagonal = sizeMeters * Math.sqrt(2) / 2; // Half the diagonal length of the square
  
  for (let i = 0; i < 4; i++) {
    const theta = (rotationDegrees + i * 90 + 45) * Math.PI / 180; // Rotate by 45 degrees to get the corners
    const dx = half_diagonal * Math.cos(theta);
    const dy = half_diagonal * Math.sin(theta);
    
    // Approximate conversion from meters to degrees
    const corner_lat = centerLat + (dy / 111320); // meters to degrees latitude
    const corner_lon = centerLon + (dx / (111320 * Math.cos(centerLat * Math.PI / 180))); // meters to degrees longitude
    
    corners.push([corner_lat, corner_lon]);
  }
  
  return corners;
};

// Create the actual map component
const ActualMapWidget = dynamic(() => {
  return import('react-leaflet').then((mod) => {
    const { MapContainer, TileLayer, Polygon, LayersControl, useMap, useMapEvents } = mod;
    
    // Internal component that uses Leaflet hooks
    function MapContent({ coordinates, onCoordinatesChange, size, rotation }) {
      const [isDragging, setIsDragging] = useState(false);
      const [dragStart, setDragStart] = useState(null);
      const [currentDragCoords, setCurrentDragCoords] = useState(null);
      const polygonRef = useRef();
      const updateTimeout = useRef(null);
      
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
      
      // Use drag coordinates if dragging, otherwise use form coordinates
      const displayLat = isDragging && currentDragCoords ? currentDragCoords.lat : centerLat;
      const displayLon = isDragging && currentDragCoords ? currentDragCoords.lng : centerLon;
      const rectangleCorners = getRotatedRectangleCorners(displayLat, displayLon, size, rotation);
      
      // Throttled coordinate update function
      const handleCenterChange = (newLat, newLon) => {
        const formattedCoords = `${newLat.toFixed(6)}, ${newLon.toFixed(6)}`;
        onCoordinatesChange(formattedCoords);
      };
      
      // Throttled update during drag
      const throttledUpdate = (newLat, newLon) => {
        // Clear existing timeout
        if (updateTimeout.current) {
          clearTimeout(updateTimeout.current);
        }
        
        // Update visual position immediately for smooth dragging
        setCurrentDragCoords({ lat: newLat, lng: newLon });
        
        // Throttle the actual coordinate updates to form (every 150ms)
        updateTimeout.current = setTimeout(() => {
          handleCenterChange(newLat, newLon);
        }, 150);
      };
      
      // Map event handler for click-to-move (as fallback)
      const map = useMap();
      
      const mapEvents = useMapEvents({
        click: (e) => {
          // Only handle map clicks if not dragging and not clicking on polygon
          if (!isDragging) {
            const { lat, lng } = e.latlng;
            handleCenterChange(lat, lng);
          }
        },
        mousemove: (e) => {
          // Handle drag movement
          if (isDragging && dragStart) {
            e.originalEvent.preventDefault();
            const { lat, lng } = e.latlng;
            const deltaLat = lat - dragStart.lat;
            const deltaLng = lng - dragStart.lng;
            
            const newCenterLat = dragStart.centerLat + deltaLat;
            const newCenterLng = dragStart.centerLng + deltaLng;
            
            // Use throttled update during drag
            throttledUpdate(newCenterLat, newCenterLng);
          }
        },
        mouseup: () => {
          // End drag
          if (isDragging) {
            setIsDragging(false);
            setDragStart(null);
            setCurrentDragCoords(null);
            map.dragging.enable();
            
            // Clear any pending throttled update
            if (updateTimeout.current) {
              clearTimeout(updateTimeout.current);
              updateTimeout.current = null;
            }
            
            // Do a final update with current position
            if (currentDragCoords) {
              handleCenterChange(currentDragCoords.lat, currentDragCoords.lng);
            }
          }
        }
      });
      
      // Update map view when coordinates change from form (but not during drag)
      useEffect(() => {
        if (!isDragging && centerLat && centerLon && !isNaN(centerLat) && !isNaN(centerLon)) {
          map.setView([centerLat, centerLon], map.getZoom());
        }
      }, [centerLat, centerLon, map, isDragging]);
      
      // Cleanup timeout on unmount
      useEffect(() => {
        return () => {
          if (updateTimeout.current) {
            clearTimeout(updateTimeout.current);
          }
        };
      }, []);
      
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
            ref={polygonRef}
            positions={rectangleCorners}
            pathOptions={{
              color: isDragging ? '#60a5fa' : '#3b82f6',
              fillColor: isDragging ? '#60a5fa' : '#3b82f6',
              fillOpacity: isDragging ? 0.4 : 0.3,
              weight: isDragging ? 3 : 2,
              interactive: true
            }}
            eventHandlers={{
              mousedown: (e) => {
                e.originalEvent.preventDefault();
                setIsDragging(true);
                setDragStart({
                  lat: e.latlng.lat,
                  lng: e.latlng.lng,
                  centerLat: centerLat,
                  centerLng: centerLon
                });
                map.dragging.disable(); // Disable map dragging
              },
              mouseover: (e) => {
                if (!isDragging) {
                  e.target.setStyle({
                    color: '#2563eb',
                    fillOpacity: 0.4,
                    weight: 3
                  });
                  // Change cursor to indicate it's draggable
                  map.getContainer().style.cursor = 'move';
                }
              },
              mouseout: (e) => {
                if (!isDragging) {
                  e.target.setStyle({
                    color: '#3b82f6',
                    fillOpacity: 0.3,
                    weight: 2
                  });
                  // Reset cursor
                  map.getContainer().style.cursor = '';
                }
              }
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
