import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isValidFilename, isValidDirectory, sanitizeFilePath } from '@/utils/securityUtils';
import securityLogger from '@/utils/securityLogger';

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

    // Validate new filename
    if (!isValidFilename(newName)) {
      securityLogger.fileSecurityEvent('rename', newName, 'Invalid filename');
      return NextResponse.json({ 
        error: 'Invalid file name. Only alphanumeric characters, spaces, dashes, underscores, and dots are allowed.' 
      }, { status: 400 });
    }

    // Normalize old path
    const normalizedOldPath = path.normalize(oldPath);
    
    // Validate directory
    const directory = path.dirname(normalizedOldPath);
    if (!isValidDirectory(directory)) {
      securityLogger.fileSecurityEvent('rename', oldPath, 'Invalid directory');
      return NextResponse.json({ 
        error: 'Invalid file path' 
      }, { status: 400 });
    }

    if (!fs.existsSync(normalizedOldPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Construct new path safely
    const newPath = sanitizeFilePath(directory, newName);
    if (!newPath) {
      securityLogger.fileSecurityEvent('rename', newName, 'Path sanitization failed');
      return NextResponse.json({ 
        error: 'Invalid new file path' 
      }, { status: 400 });
    }

    // Check if target already exists
    if (fs.existsSync(newPath) && newPath !== normalizedOldPath) {
      return NextResponse.json({ error: 'File with this name already exists' }, { status: 409 });
    }

    fs.renameSync(normalizedOldPath, newPath);

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