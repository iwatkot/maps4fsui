import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/files/rename - Rename a file
 * Body: { oldPath: string, newName: string }
 */
export async function POST(request) {
  try {
    const { oldPath, newName } = await request.json();

    if (!oldPath || !newName) {
      return NextResponse.json({ error: 'oldPath and newName parameters are required' }, { status: 400 });
    }

    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Validate new name (basic security check)
    if (newName.includes('/') || newName.includes('\\') || newName.includes('..')) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const directory = path.dirname(oldPath);
    const newPath = path.join(directory, newName);

    // Check if target already exists
    if (fs.existsSync(newPath) && newPath !== oldPath) {
      return NextResponse.json({ error: 'File with this name already exists' }, { status: 409 });
    }

    fs.renameSync(oldPath, newPath);

    return NextResponse.json({ 
      success: true,
      newPath: newPath,
      message: 'File renamed successfully'
    });
  } catch (error) {
    console.error('Error renaming file:', error);
    return NextResponse.json(
      { error: 'Failed to rename file' },
      { status: 500 }
    );
  }
}