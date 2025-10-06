import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '../../../config.js';

/**
 * POST /api/presets/save-osm - Save custom OSM file to presets
 * Body: { mapId: string, filename: string }
 */
export async function POST(request) {
  try {
    const { mapId, filename } = await request.json();

    if (!mapId || !filename) {
      return NextResponse.json({ error: 'Missing required fields: mapId, filename' }, { status: 400 });
    }

    // Source path - custom OSM file in map directory
    const mapDir = path.join(config.mfsMapDir, mapId);
    const sourcePath = path.join(mapDir, 'custom_osm.osm');

    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json({ error: 'Custom OSM file not found' }, { status: 404 });
    }

    // Target directory
    const targetDir = config.mfsDefaultsOsmDir;
    
    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!sanitizedFilename.endsWith('.osm')) {
      return NextResponse.json({ error: 'Filename must end with .osm' }, { status: 400 });
    }

    const targetPath = path.join(targetDir, sanitizedFilename);

    // Copy file
    fs.copyFileSync(sourcePath, targetPath);

    return NextResponse.json({ 
      success: true,
      message: 'Custom OSM saved to presets',
      filename: sanitizedFilename,
      path: targetPath
    });
  } catch (error) {
    console.error('Error saving OSM to presets:', error);
    return NextResponse.json(
      { error: 'Failed to save OSM to presets' },
      { status: 500 }
    );
  }
}