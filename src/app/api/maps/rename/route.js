import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '../../../config.js';

/**
 * Rename a map by updating the name.txt file
 */
export async function POST(request) {
  try {
    const { mapId, newName } = await request.json();
    
    if (!mapId || !newName) {
      return NextResponse.json(
        { error: 'Map ID and new name are required' },
        { status: 400 }
      );
    }

    const mfsMapDir = config.mfsMapDir;
    const mapDir = path.join(mfsMapDir, mapId);
    
    // Check if map directory exists
    if (!fs.existsSync(mapDir)) {
      return NextResponse.json(
        { error: 'Map not found' },
        { status: 404 }
      );
    }

    // Write the new name to name.txt
    const nameFilePath = path.join(mapDir, 'name.txt');
    fs.writeFileSync(nameFilePath, newName, 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'Map renamed successfully',
      newName 
    });
  } catch (error) {
    console.error('Error renaming map:', error);
    return NextResponse.json(
      { error: 'Failed to rename map' },
      { status: 500 }
    );
  }
}
