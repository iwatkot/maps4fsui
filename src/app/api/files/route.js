import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API route for file operations: list, content, rename, delete
 */

/**
 * POST /api/files/list - List files in a directory
 * Body: { directory: string, extensions?: string[] }
 */
export async function POST(request) {
  try {
    const { directory, extensions } = await request.json();

    if (!directory) {
      return NextResponse.json({ error: 'Directory parameter is required' }, { status: 400 });
    }

    if (!fs.existsSync(directory)) {
      return NextResponse.json({ files: [] });
    }

    const files = [];
    const items = fs.readdirSync(directory, { withFileTypes: true });

    for (const item of items) {
      if (item.isFile()) {
        const filePath = path.join(directory, item.name);
        
        // Filter by extensions if specified
        if (extensions && extensions.length > 0) {
          const fileExt = path.extname(item.name).toLowerCase();
          if (!extensions.some(ext => ext.toLowerCase() === fileExt)) {
            continue;
          }
        }

        try {
          const stats = fs.statSync(filePath);
          files.push({
            name: item.name,
            path: filePath,
            size: stats.size,
            created: stats.birthtime.toISOString(),
            modified: stats.mtime.toISOString()
          });
        } catch (statError) {
          console.warn(`Failed to get stats for ${filePath}:`, statError);
          // Include file without stats if stat fails
          files.push({
            name: item.name,
            path: filePath,
            size: null,
            created: null,
            modified: null
          });
        }
      }
    }

    // Sort files by name
    files.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}