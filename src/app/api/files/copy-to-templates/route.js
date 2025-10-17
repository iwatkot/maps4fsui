import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '@/app/config.js';

/**
 * POST /api/files/copy-to-templates
 * Body: { sourcePath: string, game: string, type: 'texture'|'tree', mapName: string }
 * Copies a file from a map folder into the templates directory for the given game and type.
 */
export async function POST(request) {
  try {
    const { sourcePath, game, type, mapName } = await request.json();

    if (!sourcePath || !game || !type || !mapName) {
      return NextResponse.json({ error: 'sourcePath, game, type and mapName are required' }, { status: 400 });
    }

    // Basic security checks
    if (sourcePath.includes('..') || sourcePath.includes('\0')) {
      return NextResponse.json({ error: 'Invalid sourcePath' }, { status: 400 });
    }

    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json({ error: 'Source file not found' }, { status: 404 });
    }

    // Validate type
    if (!['texture', 'tree'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Map game value to directory name used in templates (expecting 'fs25' or 'fs22')
    const gameDir = game.toLowerCase();

    // Determine destination directory
    const schemaDirName = type === 'texture' ? 'texture_schemas' : 'tree_schemas';
    const destDir = path.join(config.mfsTemplatesDir, gameDir, schemaDirName);

    // Ensure destination exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Sanitize mapName to a filename-safe string
    const safeMapName = mapName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const destFilename = `${safeMapName}_${type}_schema.json`;
    const destPath = path.join(destDir, destFilename);

    // If destination already exists, append a short timestamp to avoid overwrite
    let finalDestPath = destPath;
    if (fs.existsSync(finalDestPath)) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      finalDestPath = path.join(destDir, `${safeMapName}_${type}_schema_${stamp}.json`);
    }

    // Perform copy
    fs.copyFileSync(sourcePath, finalDestPath);

    return NextResponse.json({ success: true, path: finalDestPath, filename: path.basename(finalDestPath) });
  } catch (error) {
    console.error('Error copying file to templates:', error);
    return NextResponse.json({ error: 'Failed to copy file' }, { status: 500 });
  }
}
