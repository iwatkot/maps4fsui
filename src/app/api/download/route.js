import { NextResponse } from 'next/server';

// MinIO bucket configuration
const MINIO_ENDPOINT = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'https://storage.atlasfs.xyz';
const BUCKET_NAME = 'windows-app';

export async function GET(request) {
  try {
    // MinIO/S3 ListBucket API endpoint
    const listUrl = `${MINIO_ENDPOINT}/${BUCKET_NAME}/`;
    
    const response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch from MinIO:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch files from storage' },
        { status: 500 }
      );
    }

    const xmlText = await response.text();
    
    // Parse XML to extract .exe files
    const files = parseMinioXmlResponse(xmlText);
    
    // Filter for .exe files only and add download URLs
    const exeFiles = files
      .filter(file => file.name.toLowerCase().endsWith('.exe'))
      .map(file => ({
        ...file,
        url: `${MINIO_ENDPOINT}/${BUCKET_NAME}/${file.name}`
      }))
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)); // Sort by date, newest first

    return NextResponse.json({ files: exeFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Parse MinIO XML response to extract file information
 * @param {string} xmlText - XML response from MinIO ListBucket
 * @returns {Array} Array of file objects with name, size, and lastModified
 */
function parseMinioXmlResponse(xmlText) {
  const files = [];
  
  // Simple regex-based XML parsing (for production, consider using a proper XML parser)
  const contentRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
  const keyRegex = /<Key>(.*?)<\/Key>/;
  const sizeRegex = /<Size>(.*?)<\/Size>/;
  const lastModifiedRegex = /<LastModified>(.*?)<\/LastModified>/;
  
  let match;
  while ((match = contentRegex.exec(xmlText)) !== null) {
    const content = match[1];
    
    const keyMatch = content.match(keyRegex);
    const sizeMatch = content.match(sizeRegex);
    const lastModifiedMatch = content.match(lastModifiedRegex);
    
    if (keyMatch && keyMatch[1]) {
      files.push({
        name: keyMatch[1],
        size: sizeMatch ? parseInt(sizeMatch[1], 10) : null,
        lastModified: lastModifiedMatch ? lastModifiedMatch[1] : null,
      });
    }
  }
  
  return files;
}
