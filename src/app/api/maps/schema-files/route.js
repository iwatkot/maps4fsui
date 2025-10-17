import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '@/app/config.js';

/**
 * GET /api/maps/schema-files?mapId=xxx
 * Returns info about texture_custom_schema.json and tree_custom_schema.json if present
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('mapId');

    if (!mapId) {
      return NextResponse.json({ error: 'mapId is required' }, { status: 400 });
    }

    const mapDir = path.join(config.mfsMapDir, mapId);
    if (!fs.existsSync(mapDir)) {
      return NextResponse.json({ error: 'Map directory not found' }, { status: 404 });
    }

    const texturePath = path.join(mapDir, 'texture_custom_schema.json');
    const treePath = path.join(mapDir, 'tree_custom_schema.json');

    const result = {
      texture: fs.existsSync(texturePath) ? texturePath : null,
      tree: fs.existsSync(treePath) ? treePath : null
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking schema files:', error);
    return NextResponse.json({ error: 'Failed to check schema files' }, { status: 500 });
  }
}
