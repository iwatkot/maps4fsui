import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '../../../config.js';

/**
 * Delete a map directory completely
 */
export async function DELETE(request) {
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
    
    // Check if directory exists
    if (!fs.existsSync(mapDir)) {
      return NextResponse.json(
        { error: 'Map directory not found' },
        { status: 404 }
      );
    }
    
    // Delete the entire directory recursively
    await fs.promises.rm(mapDir, { recursive: true, force: true });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Map deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting map:', error);
    return NextResponse.json(
      { error: 'Failed to delete map' },
      { status: 500 }
    );
  }
}
