'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

/**
 * STL Model component that loads and displays an STL file
 */
function StlModel({ url, onError }) {
  const meshRef = useRef();
  const [isLoading, setIsLoading] = useState(true);

  let geometry;
  
  try {
    geometry = useLoader(STLLoader, url);
    
    if (geometry) {
      // Center the geometry
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      
      // Scale to fit in view
      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim; // Scale to fit in a 2-unit cube
      
      if (isLoading) {
        setIsLoading(false);
      }

      return (
        <mesh
          ref={meshRef}
          geometry={geometry}
          scale={[scale, scale, scale]}
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to standard orientation
        >
          <meshStandardMaterial 
            color="#4f46e5" 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      );
    }
  } catch (error) {
    console.error('STL loading error:', error);
    if (onError) {
      onError(`Failed to load STL: ${error.message}`);
    }
    return null;
  }

  return null;
}

/**
 * Loading component
 */
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <div className="text-3xl animate-spin mb-2">⏳</div>
        <div className="text-gray-600 dark:text-gray-400">Loading 3D Model...</div>
      </div>
    </div>
  );
}

/**
 * Error component for STL loading failures
 */
function StlError({ error, filename, onRetry }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
      <div className="text-3xl mb-3">❌</div>
      <div className="text-lg font-medium">Failed to Load 3D Model</div>
      <div className="text-sm text-center px-4 mb-4">
        Could not load STL file: {filename}
      </div>
      {error && (
        <div className="text-xs text-red-500 dark:text-red-400 text-center px-4 mb-4">
          {error}
        </div>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * STL Viewer component
 * @param {string} url - URL to the STL file
 * @param {string} filename - Name of the STL file
 * @param {number} size - File size in bytes
 * @param {function} onError - Error callback
 */
export default function StlViewer({ url, filename, size, onError }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const handleError = (error) => {
    console.error('STL Viewer Error:', error);
    setHasError(true);
    setErrorMessage(error);
    if (onError) {
      onError(error);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    setRetryKey(prev => prev + 1); // Force re-render
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (hasError) {
    return (
      <StlError 
        error={errorMessage} 
        filename={filename} 
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div key={retryKey} className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        onError={(error) => handleError(`Canvas error: ${error.message}`)}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[3, 3, 3]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          
          {/* Environment for better reflections */}
          <Environment preset="studio" />
          
          {/* STL Model */}
          <StlModel url={url} onError={handleError} />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={10}
            autoRotate={false}
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
      
      {/* Loading overlay */}
      <Suspense fallback={<LoadingFallback />}>
        {/* This will show the loading fallback while STL is loading */}
      </Suspense>
      
      {/* File info overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="font-medium text-sm">{filename}</div>
        <div className="text-xs opacity-80">
          {formatFileSize(size)} • 3D Model (STL)
        </div>
      </div>
      
      {/* Controls info */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
        <div className="flex flex-col space-y-1">
          <div>🖱️ Rotate: Left click + drag</div>
          <div>🔍 Zoom: Scroll wheel</div>
          <div>✋ Pan: Right click + drag</div>
        </div>
      </div>
    </div>
  );
}
