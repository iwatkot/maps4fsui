import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/files/save - Save content to a file
 * Body: { directory: string, filename: string, content: string }
 */
export async function POST(request) {
  try {
    const { directory, filename, content } = await request.json();

    if (!directory || !filename || content === undefined) {
      return NextResponse.json({ 
        error: 'directory, filename, and content parameters are required' 
      }, { status: 400 });
    }

    // Basic security checks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    if (directory.includes('..')) {
      return NextResponse.json({ error: 'Invalid directory path' }, { status: 400 });
    }

    // Ensure directory exists
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Full file path
    const filePath = path.join(directory, filename);
    
    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');

    return NextResponse.json({ 
      success: true,
      message: 'File saved successfully',
      filename: filename,
      path: filePath
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    );
  }
}