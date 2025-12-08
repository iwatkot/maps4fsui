import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  isValidFilename, 
  isValidDirectory, 
  sanitizeFilePath, 
  validateFileContent 
} from '@/utils/securityUtils';
import securityLogger from '@/utils/securityLogger';

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

    // Enhanced security validation
    if (!isValidFilename(filename)) {
      securityLogger.fileSecurityEvent('save', filename, 'Invalid filename');
      return NextResponse.json({ 
        error: 'Invalid filename. Only alphanumeric characters, dashes, underscores, and dots are allowed.' 
      }, { status: 400 });
    }

    if (!isValidDirectory(directory)) {
      securityLogger.fileSecurityEvent('save', directory, 'Invalid directory');
      return NextResponse.json({ 
        error: 'Invalid directory path' 
      }, { status: 400 });
    }

    // Validate content
    const contentValidation = validateFileContent(content);
    if (!contentValidation.valid) {
      return NextResponse.json({ 
        error: contentValidation.reason 
      }, { status: 400 });
    }

    // Sanitize the full file path
    const filePath = sanitizeFilePath(directory, filename);
    if (!filePath) {
      securityLogger.fileSecurityEvent('save', `${directory}/${filename}`, 'Path sanitization failed');
      return NextResponse.json({ 
        error: 'Invalid file path' 
      }, { status: 400 });
    }

    // Ensure directory exists
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
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