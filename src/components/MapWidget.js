'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Helper function to calculate rotated rectangle corners
const getRotatedRectangleCorners = (centerLat, centerLon, sizeMeters, rotationDegrees) => {
  const corners = [];
  const half_diagonal = sizeMeters * Math.sqrt(2) / 2; // Half the diagonal length of the square
  
  // Invert the rotation (45 -> -45, -45 -> 45)
  const invertedRotation = -rotationDegrees;
  
  for (let i = 0; i < 4; i++) {
    const theta = (invertedRotation + i * 90 + 45) * Math.PI / 180; // Rotate by 45 degrees to get the corners
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
    const { MapContainer, TileLayer, Polygon, LayersControl, useMap, useMapEvents, CircleMarker, Marker, GeoJSON } = mod;
    
    // Generic Icon Handle Component
    function IconHandle({ 
      position, 
      isActive, 
      zmdiIcon,
      className = 'icon-overlay',
      onMouseDown, 
      onMouseOver, 
      onMouseOut 
    }) {
      return (
        <>
          <CircleMarker
            center={position}
            radius={12}
            pathOptions={{
              color: '#ffffff',
              fillColor: isActive ? '#60a5fa' : '#3b82f6',
              fillOpacity: 1,
              weight: 2,
              interactive: true
            }}
            eventHandlers={{
              mousedown: onMouseDown,
              mouseover: onMouseOver,
              mouseout: onMouseOut
            }}
          />
          
          {/* Icon overlay */}
          {typeof window !== 'undefined' && (() => {
            const L = require('leaflet');
            
            const iconHtml = `<div style="
              display: flex; 
              align-items: center; 
              justify-content: center;
              width: 24px; 
              height: 24px; 
              color: white;
              font-size: 14px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
              pointer-events: none;
              font-family: 'Material-Design-Iconic-Font', Arial, sans-serif;
            "><i class="zmdi ${zmdiIcon}"></i></div>`;
            
            const iconMarker = L.divIcon({
              html: iconHtml,
              className: className,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            
            return (
              <Marker
                position={position}
                icon={iconMarker}
                eventHandlers={{}}
                interactive={false}
              />
            );
          })()}
        </>
      );
    }
    
    // Internal component that uses Leaflet hooks
    function MapContent({ coordinates, onCoordinatesChange, size, rotation, onRotationChange, onSizeChange, showResizeHandle, osmData }) {
      const [isDragging, setIsDragging] = useState(false);
      const [isRotating, setIsRotating] = useState(false);
      const [isResizing, setIsResizing] = useState(false);
      const [dragStart, setDragStart] = useState(null);
      const [rotationStart, setRotationStart] = useState(null);
      const [resizeStart, setResizeStart] = useState(null);
      const [currentDragCoords, setCurrentDragCoords] = useState(null);
      const [lastActionWasDrag, setLastActionWasDrag] = useState(false);
      const lastCoordinatesRef = useRef(coordinates);
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
      
      // Calculate rotation handle position (always at a fixed offset from center, regardless of rectangle corners)
      const handleDistance = size * Math.sqrt(2) / 2; // Half diagonal of the square
      const handleAngle = (-rotation + 135) * Math.PI / 180; // Use inverted rotation + 135° offset for top-left
      const handleLat = displayLat + (handleDistance * Math.sin(handleAngle) / 111320);
      const handleLon = displayLon + (handleDistance * Math.cos(handleAngle) / (111320 * Math.cos(displayLat * Math.PI / 180)));
      const rotationHandlePosition = [handleLat, handleLon];
      
      // Calculate resize handle position (bottom-right corner)
      const resizeAngle = (-rotation + 315) * Math.PI / 180; // Use inverted rotation + 315° offset for bottom-right
      const resizeLat = displayLat + (handleDistance * Math.sin(resizeAngle) / 111320);
      const resizeLon = displayLon + (handleDistance * Math.cos(resizeAngle) / (111320 * Math.cos(displayLat * Math.PI / 180)));
      const resizeHandlePosition = [resizeLat, resizeLon];
      
      // Helper function to calculate angle between two points
      const calculateAngle = (center, point) => {
        const dx = point.lng - center.lng;
        const dy = point.lat - center.lat;
        return Math.atan2(dy, dx) * 180 / Math.PI;
      };
      
      // Handle rotation updates
      const handleRotationChange = (newRotation) => {
        if (onRotationChange) {
          // Ensure rotation is between -90 and 90 degrees
          let constrainedRotation = Math.max(-90, Math.min(90, newRotation));
          onRotationChange(Math.round(constrainedRotation));
        }
      };
      
      // Handle size updates
      const handleSizeChange = (newSize) => {
        if (onSizeChange) {
          // Ensure size is at least 100m and at most 50000m, and is an integer
          let constrainedSize = Math.max(100, Math.min(50000, Math.round(newSize)));
          onSizeChange(constrainedSize);
        }
      };
      
      // Throttled coordinate update function
      // Handle coordinate updates
      const handleCenterChange = (newLat, newLon) => {
        const formattedCoords = `${newLat.toFixed(6)}, ${newLon.toFixed(6)}`;
        onCoordinatesChange(formattedCoords);
      };
      
      // Handle coordinate updates from dragging (mark as drag action)
      const handleDragCenterChange = (newLat, newLon) => {
        setLastActionWasDrag(true);
        handleCenterChange(newLat, newLon);
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
        mousemove: (e) => {
          // Handle drag movement
          if (isDragging && dragStart && !isRotating && !isResizing) {
            e.originalEvent.preventDefault();
            const { lat, lng } = e.latlng;
            const deltaLat = lat - dragStart.lat;
            const deltaLng = lng - dragStart.lng;
            
            const newCenterLat = dragStart.centerLat + deltaLat;
            const newCenterLng = dragStart.centerLng + deltaLng;
            
            // Use throttled update during drag
            throttledUpdate(newCenterLat, newCenterLng);
          }
          
          // Handle rotation
          if (isRotating && rotationStart) {
            e.originalEvent.preventDefault();
            const center = { lat: displayLat, lng: displayLon };
            const currentAngle = calculateAngle(center, e.latlng);
            let deltaAngle = currentAngle - rotationStart.startAngle;
            
            // Handle angle wraparound more carefully
            while (deltaAngle > 180) deltaAngle -= 360;
            while (deltaAngle < -180) deltaAngle += 360;
            
            // Invert the delta angle to match the inverted rotation display
            let newRotation = rotationStart.startRotation - deltaAngle;
            
            // Apply limits with stricter bounds to prevent jumping
            const currentRotation = rotation; // Get current rotation value
            
            // Only update if the change is reasonable (prevent sudden jumps)
            const maxChange = 180; // Maximum allowed change per frame
            const rotationDiff = Math.abs(newRotation - currentRotation);
            
            if (rotationDiff <= maxChange) {
              newRotation = Math.max(-90, Math.min(90, newRotation));
              
              if (onRotationChange) {
                onRotationChange(Math.round(newRotation));
              }
            }
          }
          
          // Handle resize
          if (isResizing && resizeStart) {
            e.originalEvent.preventDefault();
            const center = { lat: displayLat, lng: displayLon };
            const currentDistance = Math.sqrt(
              Math.pow((e.latlng.lat - center.lat) * 111320, 2) + 
              Math.pow((e.latlng.lng - center.lng) * 111320 * Math.cos(center.lat * Math.PI / 180), 2)
            );
            
            // Convert distance to size (since handle is at corner, distance is half diagonal)
            const newSize = currentDistance * Math.sqrt(2);
            handleSizeChange(newSize);
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
              handleDragCenterChange(currentDragCoords.lat, currentDragCoords.lng);
            }
          }
          
          // End rotation
          if (isRotating) {
            setIsRotating(false);
            setRotationStart(null);
            map.dragging.enable();
          }
          
          // End resize
          if (isResizing) {
            setIsResizing(false);
            setResizeStart(null);
            map.dragging.enable();
          }
        }
      });
      
      // Update map view based on last action type
      useEffect(() => {
        if (!isDragging && centerLat && centerLon && !isNaN(centerLat) && !isNaN(centerLon)) {
          // Check if coordinates changed from external input (not from our drag)
          const coordinatesChanged = coordinates !== lastCoordinatesRef.current;
          
          if (coordinatesChanged && !lastActionWasDrag) {
            // Coordinates changed from external form input, center the map
            map.setView([centerLat, centerLon], map.getZoom());
            setLastActionWasDrag(false); // Reset for next external input
          } else if (coordinatesChanged && lastActionWasDrag) {
            // Coordinates changed from our drag, don't center but reset flag for future
            setLastActionWasDrag(false);
          }
          
          // Update the reference
          lastCoordinatesRef.current = coordinates;
        }
      }, [centerLat, centerLon, coordinates, map, isDragging, lastActionWasDrag]);
      
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
            <LayersControl.BaseLayer checked={!osmData} name="OpenStreetMap">
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

            {/* Clean layer for custom OSM data */}
            {osmData && (
              <LayersControl.BaseLayer checked={!!osmData} name="Custom OSM Data">
                <TileLayer
                  attribution='Custom OSM Data'
                  url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                  opacity={0}
                />
              </LayersControl.BaseLayer>
            )}
          </LayersControl>
          
          {/* Custom OSM Data Layer - Rendered below selection */}
          {osmData && osmData.geoJson && (
            <GeoJSON
              key={`osm-data-${osmData.timestamp || Date.now()}`}
              data={osmData.geoJson}
              style={(feature) => {
                // Import the style function dynamically to avoid SSR issues
                const getFeatureStyle = (feature) => {
                  const properties = feature.properties || {};
                  const geometry = feature.geometry;
                  
                  // Default styles
                  let style = {
                    weight: 2,
                    opacity: 0.9,
                    fillOpacity: 0.4
                  };
                  
                  // Roads and paths
                  if (properties.highway) {
                    const highway = properties.highway;
                    if (['motorway', 'trunk', 'primary'].includes(highway)) {
                      return { ...style, color: '#e74c3c', weight: 4 };
                    } else if (['secondary', 'tertiary'].includes(highway)) {
                      return { ...style, color: '#f39c12', weight: 3 };
                    } else if (['residential', 'unclassified', 'service'].includes(highway)) {
                      return { ...style, color: '#95a5a6', weight: 2 };
                    } else if (['footway', 'path', 'track'].includes(highway)) {
                      return { ...style, color: '#8e44ad', weight: 2, dashArray: '5, 5' };
                    }
                    return { ...style, color: '#34495e', weight: 2 };
                  }
                  
                  // Buildings
                  if (properties.building) {
                    return { 
                      ...style, 
                      color: '#2c3e50', 
                      fillColor: '#ecf0f1', 
                      weight: 2,
                      fillOpacity: 0.8 
                    };
                  }
                  
                  // Water features
                  if (properties.natural === 'water' || properties.waterway) {
                    return { 
                      ...style, 
                      color: '#3498db', 
                      fillColor: '#85c1e9', 
                      weight: 2,
                      fillOpacity: 0.7 
                    };
                  }
                  
                  // Landuse
                  if (properties.landuse) {
                    const landuse = properties.landuse;
                    if (['forest', 'wood'].includes(landuse)) {
                      return { ...style, color: '#27ae60', fillColor: '#58d68d', fillOpacity: 0.5 };
                    } else if (['farmland', 'meadow', 'grass'].includes(landuse)) {
                      return { ...style, color: '#2ecc71', fillColor: '#7dcea0', fillOpacity: 0.4 };
                    } else if (['residential', 'commercial', 'industrial'].includes(landuse)) {
                      return { ...style, color: '#95a5a6', fillColor: '#d5dbdb', fillOpacity: 0.4 };
                    }
                  }
                  
                  // Default style
                  return { ...style, color: '#7f8c8d', fillColor: '#bdc3c7' };
                };
                
                return getFeatureStyle(feature);
              }}
              pointToLayer={(feature, latlng) => {
                // Custom styling for point features
                return new (require('leaflet')).CircleMarker(latlng, {
                  radius: 4,
                  fillColor: '#e67e22',
                  color: '#d35400',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
                });
              }}
              onEachFeature={(feature, layer) => {
                // Add popup with feature information
                if (feature.properties) {
                  const props = feature.properties;
                  let popupContent = '<div class="text-xs">';
                  
                  // Add name if available
                  if (props.name) {
                    popupContent += `<strong>${props.name}</strong><br/>`;
                  }
                  
                  // Add type information
                  const type = props.highway || props.building || props.landuse || props.natural || props.amenity || 'Feature';
                  popupContent += `Type: ${type}<br/>`;
                  
                  // Add other relevant properties
                  Object.entries(props)
                    .filter(([key, value]) => 
                      !['name', 'highway', 'building', 'landuse', 'natural', 'amenity'].includes(key) && 
                      value && 
                      typeof value === 'string' && 
                      value.length < 50
                    )
                    .slice(0, 5) // Limit to 5 additional properties
                    .forEach(([key, value]) => {
                      popupContent += `${key}: ${value}<br/>`;
                    });
                  
                  popupContent += '</div>';
                  layer.bindPopup(popupContent);
                }
              }}
            />
          )}
          
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
                if (!isRotating && !isResizing) {
                  e.originalEvent.preventDefault();
                  setIsDragging(true);
                  setDragStart({
                    lat: e.latlng.lat,
                    lng: e.latlng.lng,
                    centerLat: centerLat,
                    centerLng: centerLon
                  });
                  map.dragging.disable(); // Disable map dragging
                }
              },
              mouseover: (e) => {
                if (!isDragging && !isRotating && !isResizing) {
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
                if (!isDragging && !isRotating && !isResizing) {
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
          
          {/* Rotation Handle */}
          <IconHandle
            position={rotationHandlePosition}
            isActive={isRotating}
            zmdiIcon="zmdi-refresh"
            className="rotation-icon-overlay"
            onMouseDown={(e) => {
              e.originalEvent.preventDefault();
              setIsRotating(true);
              const center = { lat: displayLat, lng: displayLon };
              const startAngle = calculateAngle(center, e.latlng);
              setRotationStart({
                startAngle: startAngle,
                startRotation: rotation
              });
              map.dragging.disable();
            }}
            onMouseOver={(e) => {
              if (!isRotating) {
                e.target.setStyle({
                  fillColor: '#2563eb',
                  radius: 14
                });
              }
            }}
            onMouseOut={(e) => {
              if (!isRotating) {
                e.target.setStyle({
                  fillColor: isDragging || isRotating ? '#60a5fa' : '#3b82f6',
                  radius: 12
                });
              }
            }}
          />
          
          {/* Resize Handle - only show when resize is enabled */}
          {showResizeHandle && (
            <IconHandle
              position={resizeHandlePosition}
              isActive={isResizing}
              zmdiIcon="zmdi-crop-free"
              className="resize-icon-overlay"
              onMouseDown={(e) => {
                e.originalEvent.preventDefault();
                setIsResizing(true);
                setResizeStart({
                  initialSize: size
                });
                map.dragging.disable();
              }}
              onMouseOver={(e) => {
                if (!isResizing) {
                  e.target.setStyle({
                    fillColor: '#2563eb',
                    radius: 14
                  });
                }
              }}
              onMouseOut={(e) => {
                if (!isResizing) {
                  e.target.setStyle({
                    fillColor: '#3b82f6',
                    radius: 12
                  });
                }
              }}
            />
          )}
        </>
      );
    }
    
    // Return the component that will be dynamically loaded
    function DynamicMapComponent({ coordinates, onCoordinatesChange, size, rotation, onRotationChange, onSizeChange, showResizeHandle, osmData }) {
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
          attributionControl={false}
        >
          <MapContent 
            coordinates={coordinates}
            onCoordinatesChange={onCoordinatesChange}
            size={size}
            rotation={rotation}
            onRotationChange={onRotationChange}
            onSizeChange={onSizeChange}
            showResizeHandle={showResizeHandle}
            osmData={osmData}
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
  rotation = 0,
  onRotationChange,
  onSizeChange,
  showResizeHandle = false,
  osmData = null
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
        onRotationChange={onRotationChange}
        onSizeChange={onSizeChange}
        showResizeHandle={showResizeHandle}
        osmData={osmData}
      />
    </div>
  );
}
