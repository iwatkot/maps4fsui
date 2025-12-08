import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '@/app/config.js';
import { isValidDirectory, isValidFilename } from '@/utils/securityUtils';
import securityLogger from '@/utils/securityLogger';

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

    // Enhanced security validation
    const normalizedSource = path.normalize(sourcePath);
    
    if (normalizedSource.includes('..') || normalizedSource.includes('\0')) {
      securityLogger.fileSecurityEvent('copy', sourcePath, 'Path traversal attempt');
      return NextResponse.json({ error: 'Invalid sourcePath' }, { status: 400 });
    }

    // Validate source directory
    const sourceDir = path.dirname(normalizedSource);
    if (!isValidDirectory(sourceDir)) {
      securityLogger.fileSecurityEvent('copy', sourcePath, 'Invalid source directory');
      return NextResponse.json({ error: 'Invalid source path' }, { status: 403 });
    }

    // Validate game and mapName (prevent injection)
    if (!/^[a-zA-Z0-9_-]+$/.test(game)) {
      return NextResponse.json({ error: 'Invalid game parameter' }, { status: 400 });
    }
    
    if (!/^[a-zA-Z0-9_\s-]+$/.test(mapName)) {
      return NextResponse.json({ error: 'Invalid mapName parameter' }, { status: 400 });
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
