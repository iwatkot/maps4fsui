import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '../../../config.js';

/**
 * POST /api/presets/save - Save JSON settings to presets
 * Body: { type: 'mainSettings' | 'generationSettings', data: object, filename: string }
 */
export async function POST(request) {
  try {
    const { type, data, filename } = await request.json();

    if (!type || !data || !filename) {
      return NextResponse.json({ error: 'Missing required fields: type, data, filename' }, { status: 400 });
    }

    // Determine target directory
    let targetDir;
    if (type === 'mainSettings') {
      targetDir = config.mfsDefaultsMSettingsDir;
    } else if (type === 'generationSettings') {
      targetDir = config.mfsDefaultsGSettingsDir;
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be mainSettings or generationSettings' }, { status: 400 });
    }

    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!sanitizedFilename.endsWith('.json')) {
      return NextResponse.json({ error: 'Filename must end with .json' }, { status: 400 });
    }

    const targetPath = path.join(targetDir, sanitizedFilename);

    // Write JSON data to file
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true,
      message: `${type} saved to presets`,
      filename: sanitizedFilename,
      path: targetPath
    });
  } catch (error) {
    console.error('Error saving to presets:', error);
    return NextResponse.json(
      { error: 'Failed to save to presets' },
      { status: 500 }
    );
  }
}