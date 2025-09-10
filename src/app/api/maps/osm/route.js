import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '../../../config.js';

/**
 * Get custom OSM file for a map if it exists
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('mapId');
    
    if (!mapId) {
      return NextResponse.json(
        { error: 'Map ID is required' },
        { status: 400 }
      );
    }

    const mfsMapDir = config.mfsMapDir;
    const mapDir = path.join(mfsMapDir, mapId);
    const customOsmPath = path.join(mapDir, 'custom_osm.osm');
    
    // Check if map directory exists
    if (!fs.existsSync(mapDir)) {
      return NextResponse.json(
        { error: 'Map directory not found' },
        { status: 404 }
      );
    }
    
    // Check if custom OSM file exists
    if (!fs.existsSync(customOsmPath)) {
      return NextResponse.json({ 
        hasCustomOsm: false,
        message: 'No custom OSM file found'
      });
    }
    
    // Read the custom OSM file
    const osmContent = await fs.promises.readFile(customOsmPath, 'utf8');
    
    return NextResponse.json({ 
      hasCustomOsm: true,
      osmContent: osmContent,
      fileName: 'custom_osm.osm'
    });
    
  } catch (error) {
    console.error('Error reading custom OSM file:', error);
    return NextResponse.json(
      { error: 'Failed to read custom OSM file' },
      { status: 500 }
    );
  }
}
