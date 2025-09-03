'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

/**
 * STL Model component that loads and displays an STL file
 */
function StlModel({ url }) {
  const meshRef = useRef();

  const geometry = useLoader(STLLoader, url);
  
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
        color="#4f46e5" 
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
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
 * STL Viewer component
 * @param {string} url - URL to the STL file
 * @param {string} filename - Name of the STL file
 * @param {number} size - File size in bytes
 * @param {function} onError - Error callback
 */
export default function StlViewer({ url, filename, size, onError }) {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
          <StlModel url={url} />
          
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
