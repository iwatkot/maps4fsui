import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isValidDirectory } from '@/utils/securityUtils';
import securityLogger from '@/utils/securityLogger';

/**
 * GET /api/files/content - Get file content (for images via query param)
 * POST /api/files/content - Get file content (for text files via body)
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json({ error: 'filePath parameter is required' }, { status: 400 });
    }

    // Normalize and validate path
    const normalizedPath = path.normalize(filePath);
    
    // Security validation
    if (normalizedPath.includes('..') || normalizedPath.includes('\0')) {
      securityLogger.fileSecurityEvent('read', filePath, 'Path traversal attempt');
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const directory = path.dirname(normalizedPath);
    if (!isValidDirectory(directory)) {
      securityLogger.fileSecurityEvent('read', filePath, 'Invalid directory');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // For image files, return as blob
    const ext = path.extname(normalizedPath).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
      const fileBuffer = fs.readFileSync(normalizedPath);
      const mimeType = getMimeType(ext);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // For other files, return as text
    const content = fs.readFileSync(normalizedPath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: 'filePath parameter is required' }, { status: 400 });
    }

    // Normalize and validate path
    const normalizedPath = path.normalize(filePath);
    
    // Security validation
    if (normalizedPath.includes('..') || normalizedPath.includes('\0')) {
      securityLogger.fileSecurityEvent('read', filePath, 'Path traversal attempt');
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const directory = path.dirname(normalizedPath);
    if (!isValidDirectory(directory)) {
      securityLogger.fileSecurityEvent('read', filePath, 'Invalid directory');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const content = fs.readFileSync(normalizedPath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}

function getMimeType(extension) {
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[extension] || 'application/octet-stream';
}