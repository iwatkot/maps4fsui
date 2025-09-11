'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import { getAuthenticatedStlUrl, revokeBlobUrl } from '@/utils/authenticatedFetch';

/**
 * STL Model component that loads and displays an STL file
 */
function StlModel({ blobUrl }) {
  const meshRef = useRef();

  const geometry = useLoader(STLLoader, blobUrl);
  
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

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={[scale, scale, scale]}
      rotation={[-Math.PI / 2, 0, 0]} // Rotate to standard orientation
    >
      <meshStandardMaterial 
        color="#6b7280"
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

/**
 * Loading component - now returns empty div
 */
function LoadingFallback() {
  return (
    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800"></div>
  );
}

/**
 * STL Viewer component
 * @param {string} url - STL file URL
 * @param {string} filename - STL filename  
 * @param {number} size - File size in bytes
 * @param {boolean} isLocal - Whether this is a local file (no auth needed)
 * @param {function} onError - Error callback
 */
export default function StlViewer({ url, filename, size, isLocal = false, onError }) {
  const [stlBlobUrl, setStlBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load authenticated STL file
  useEffect(() => {
    const loadStl = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        let blobUrl;
        if (isLocal) {
          // Use direct URL for local files - no authentication needed
          blobUrl = url;
        } else {
          // Use authenticated fetch for backend API files
          blobUrl = await getAuthenticatedStlUrl(url);
        }
        
        setStlBlobUrl(blobUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load STL:', error);
        setHasError(true);
        setIsLoading(false);
        if (onError) {
          onError(`Failed to load STL: ${error.message}`);
        }
      }
    };

    loadStl();

    // Cleanup blob URL on unmount or URL change (only for authenticated files)
    return () => {
      if (stlBlobUrl && !isLocal && stlBlobUrl.startsWith('blob:')) {
        revokeBlobUrl(stlBlobUrl);
      }
    };
  }, [url, isLocal, onError, stlBlobUrl]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (hasError || !stlBlobUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
        <div className="text-3xl mb-3">❌</div>
        <div className="text-lg font-medium">Failed to Load 3D Model</div>
        <div className="text-sm text-center px-4">
          Could not load STL file: {filename}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
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
          <StlModel blobUrl={stlBlobUrl} />
          
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
    </div>
  );
}
