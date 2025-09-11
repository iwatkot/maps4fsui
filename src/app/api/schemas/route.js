import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import config from '@/app/config';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const schemaType = searchParams.get('type') || 'tree';
    const gameVersion = searchParams.get('version') || 'fs25';
    
    // Construct the schema file name
    const schemaFileName = `${gameVersion}-${schemaType}-schema.json`;
    const schemaFilePath = path.join(config.mfsTemplatesDir, schemaFileName);
    
    try {
      // Check if file exists and read it
      const schemaData = await fs.readFile(schemaFilePath, 'utf8');
      const parsedSchema = JSON.parse(schemaData);
      
      return NextResponse.json({
        success: true,
        data: parsedSchema,
        fileName: schemaFileName,
        schemaType,
        gameVersion
      });
    } catch (fileError) {
      // If file doesn't exist or can't be read
      if (fileError.code === 'ENOENT') {
        return NextResponse.json({
          success: false,
          error: `Schema file not found: ${schemaFileName}`,
          fileName: schemaFileName,
          schemaType,
          gameVersion
        }, { status: 404 });
      }
      
      throw fileError;
    }
  } catch (error) {
    console.error('Error fetching schema:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch schema file',
      details: error.message
    }, { status: 500 });
  }
}

// Also support listing available schemas
export async function POST(request) {
  try {
    const templatesDir = config.mfsTemplatesDir;
    
    try {
      const files = await fs.readdir(templatesDir);
      const schemaFiles = files.filter(file => 
        file.endsWith('-schema.json') && 
        (file.includes('-tree-') || file.includes('-texture-'))
      );
      
      const schemas = schemaFiles.map(file => {
        const [gameVersion, schemaType] = file.replace('-schema.json', '').split('-');
        return {
          fileName: file,
          gameVersion,
          schemaType,
          available: true
        };
      });
      
      return NextResponse.json({
        success: true,
        schemas
      });
    } catch (dirError) {
      return NextResponse.json({
        success: false,
        error: 'Templates directory not accessible',
        details: dirError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error listing schemas:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list schema files',
      details: error.message
    }, { status: 500 });
  }
}
