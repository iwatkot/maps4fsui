import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isValidDirectory } from '@/utils/securityUtils';
import securityLogger from '@/utils/securityLogger';

/**
 * DELETE /api/files/delete - Delete a file
 * Body: { filePath: string }
 */
export async function DELETE(request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: 'filePath parameter is required' }, { status: 400 });
    }

    // Normalize path to resolve any traversal attempts
    const normalizedPath = path.normalize(filePath);
    
    // Enhanced security check - validate the directory
    const directory = path.dirname(normalizedPath);
    if (!isValidDirectory(directory)) {
      securityLogger.fileSecurityEvent('delete', filePath, 'Invalid directory');
      return NextResponse.json({ 
        error: 'Access denied: invalid file path' 
      }, { status: 403 });
    }

    // Additional checks for path traversal
    if (normalizedPath.includes('..') || normalizedPath.includes('\0')) {
      securityLogger.fileSecurityEvent('delete', filePath, 'Path traversal attempt');
      return NextResponse.json({ 
        error: 'Invalid file path' 
      }, { status: 400 });
    }

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    fs.unlinkSync(normalizedPath);

    return NextResponse.json({ 
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}