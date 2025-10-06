import { NextResponse } from 'next/server';
import fs from 'fs';

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

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Basic security check - ensure we're not deleting system files
    if (filePath.includes('..') || filePath.startsWith('/etc') || filePath.startsWith('/usr/bin')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    fs.unlinkSync(filePath);

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