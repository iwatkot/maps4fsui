import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createWriteStream, createReadStream } from 'fs';
import archiver from 'archiver';
import config from '../../../config.js';

/**
 * Download map data as ZIP archive
 * Checks if archive exists, creates if not, then serves it
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
    const archivePath = path.join(mfsMapDir, `${mapId}.zip`);
    
    // Check if map directory exists
    if (!fs.existsSync(mapDir)) {
      return NextResponse.json(
        { error: 'Map directory not found' },
        { status: 404 }
      );
    }
    
    // Check if archive already exists
    if (!fs.existsSync(archivePath)) {
      // Create the archive
      await createZipArchive(mapDir, archivePath);
    }
    
    // Serve the archive using streaming
    const stat = await fs.promises.stat(archivePath);
    const readStream = fs.createReadStream(archivePath);
    
    return new NextResponse(readStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${mapId}.zip"`,
        'Content-Length': stat.size.toString(),
      },
    });
    
  } catch (error) {
    console.error('Error downloading map:', error);
    return NextResponse.json(
      { error: 'Failed to download map' },
      { status: 500 }
    );
  }
}

/**
 * Create a ZIP archive of the map directory
 */
async function createZipArchive(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      console.log(`Archive created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    
    // Add the entire directory to the archive
    archive.directory(sourceDir, false);
    
    archive.finalize();
  });
}
