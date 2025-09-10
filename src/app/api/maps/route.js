import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import config from '../../config.js';

/**
 * Get all maps from the filesystem
 * Scans the mfsMapDir for directories containing main_settings.json and generation_settings.json
 */
export async function GET() {
  try {
    const mfsMapDir = config.mfsMapDir;
    
    if (!fs.existsSync(mfsMapDir)) {
      return NextResponse.json({ maps: [] });
    }

    const maps = [];
    const items = fs.readdirSync(mfsMapDir, { withFileTypes: true });
    
    // Check all directories, regardless of naming pattern
    const directories = items.filter(item => item.isDirectory());

    for (const dir of directories) {
      const mapDir = path.join(mfsMapDir, dir.name);
      const mainSettingsPath = path.join(mapDir, 'main_settings.json');
      const generationSettingsPath = path.join(mapDir, 'generation_settings.json');
      const generationInfoPath = path.join(mapDir, 'generation_info.json');
      
      // Check if both required JSON files exist
      if (fs.existsSync(mainSettingsPath) && fs.existsSync(generationSettingsPath)) {
        try {
          // Read and parse JSON files
          const mainSettingsData = JSON.parse(fs.readFileSync(mainSettingsPath, 'utf8'));
          const generationSettingsData = JSON.parse(fs.readFileSync(generationSettingsPath, 'utf8'));
          
          // Try to read generation_info.json if it exists
          let generationInfoData = null;
          if (fs.existsSync(generationInfoPath)) {
            try {
              generationInfoData = JSON.parse(fs.readFileSync(generationInfoPath, 'utf8'));
            } catch (error) {
              console.error(`Error reading generation_info.json for ${dir.name}:`, error);
            }
          }
          
          // Get directory stats for creation date
          const stats = fs.statSync(mapDir);
          
          // Determine map status based on JSON data and file existence
          const status = determineMapStatus(mapDir, mainSettingsData);
          
          // Find custom name (from name.txt if exists, otherwise create it with directory name)
          const customName = findMapName(mapDir, dir.name);
          
          // Create proper datetime from JSON fields
          const createdDateTime = `${mainSettingsData.date} ${mainSettingsData.time}`;
          
          // Create map object
          const mapData = {
            id: dir.name, // Use directory name as ID
            name: customName,
            directory: dir.name,
            coordinates: `${mainSettingsData.latitude}, ${mainSettingsData.longitude}`,
            size: mainSettingsData.size,
            outputSize: mainSettingsData.output_size,
            game: getGameFromSettings(mainSettingsData),
            createdAt: createdDateTime,
            status: status,
            error: status === 'error' ? mainSettingsData.error : null, // Include error message for failed maps
            country: mainSettingsData.country,
            rotation: mainSettingsData.rotation,
            dtmProvider: mainSettingsData.dtm_provider,
            date: mainSettingsData.date,
            time: mainSettingsData.time,
            mainSettings: mainSettingsData,
            generationSettings: generationSettingsData,
            generationInfo: generationInfoData,
            previews: getPreviewFiles(mapDir)
          };

          maps.push(mapData);
        } catch (error) {
          console.error(`Error processing map directory ${dir.name}:`, error);
          // Skip this directory if JSON parsing fails
          continue;
        }
      }
    }

    // Sort maps by creation date and time from JSON (newest first)
    maps.sort((a, b) => {
      // Create datetime strings from JSON date and time fields
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeB - dateTimeA; // Newest first
    });

    return NextResponse.json({ maps });
  } catch (error) {
    console.error('Error reading maps directory:', error);
    return NextResponse.json(
      { error: 'Failed to read maps directory', maps: [] },
      { status: 500 }
    );
  }
}

/**
 * Determine the status of a map based on JSON data and file existence
 */
function determineMapStatus(mapPath, mainSettings) {
  // First priority: Check for errors
  if (mainSettings.error && mainSettings.error !== null) {
    return 'error';
  }
  
  // Second priority: Check completion status
  if (mainSettings.completed === true) {
    return 'completed';
  }
  
  if (mainSettings.completed === false) {
    // Check if generation is still in progress
    const lockFile = path.join(mapPath, '.generating');
    if (fs.existsSync(lockFile)) {
      return 'generating';
    }
    // If no lock file but not completed and no error, it's incomplete (manually stopped)
    return 'incomplete';
  }

  // Fallback: check for file system indicators when JSON data is unclear
  const modPath = path.join(mapPath, 'mod');
  const zipFiles = fs.readdirSync(mapPath).filter(file => file.endsWith('.zip'));
  
  // If mod directory exists or zip files exist, consider it complete
  if (fs.existsSync(modPath) || zipFiles.length > 0) {
    return 'completed';
  }

  // Check for error log files
  const errorFile = path.join(mapPath, 'error.log');
  if (fs.existsSync(errorFile)) {
    return 'error';
  }

  // Check for generation in progress indicators
  const lockFile = path.join(mapPath, '.generating');
  if (fs.existsSync(lockFile)) {
    return 'generating';
  }

  // Default fallback based on JSON data
  if (mainSettings.completed === undefined || mainSettings.completed === null) {
    return 'incomplete';
  }
  
  return mainSettings.completed ? 'completed' : 'incomplete';
}

/**
 * Find custom map name from name.txt or create it with directory name
 */
function findMapName(mapPath, directoryName) {
  const nameFile = path.join(mapPath, 'name.txt');
  if (fs.existsSync(nameFile)) {
    try {
      return fs.readFileSync(nameFile, 'utf8').trim();
    } catch (error) {
      console.error('Error reading name file:', error);
    }
  } else {
    // Create name.txt with directory name if it doesn't exist
    try {
      fs.writeFileSync(nameFile, directoryName, 'utf8');
      return directoryName;
    } catch (error) {
      console.error('Error creating name file:', error);
    }
  }
  return directoryName; // Fallback to directory name
}

/**
 * Determine game version from main settings
 */
function getGameFromSettings(mainSettings) {
  if (mainSettings.game) {
    const gameCode = mainSettings.game;
    switch (gameCode) {
      case 'FS25':
        return 'Farming Simulator 25';
      case 'FS22':
        return 'Farming Simulator 22';
      case 'FS19':
        return 'Farming Simulator 19';
      default:
        return `Farming Simulator ${gameCode}`;
    }
  }
  return 'Farming Simulator';
}

/**
 * Get preview image and STL files from the map directory
 */
function getPreviewFiles(mapPath) {
  try {
    const previewsDir = path.join(mapPath, 'previews');
    if (!fs.existsSync(previewsDir)) {
      return [];
    }

    const files = fs.readdirSync(previewsDir);
    const supportedExtensions = ['.png', '.jpg', '.jpeg', '.stl'];
    
    const previews = files
      .filter(file => supportedExtensions.some(ext => file.toLowerCase().endsWith(ext)))
      .map(file => {
        const filePath = path.join(previewsDir, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        
        return {
          filename: file,
          url: `/api/maps/preview?path=${encodeURIComponent(filePath)}`,
          size: stats.size,
          type: ext === '.stl' ? 'stl' : 'image',
          path: filePath,
          isLocal: true // Flag to indicate this is a local file, not from backend API
        };
      });
    
    return previews;
  } catch (error) {
    console.error('Error reading preview files:', error);
    return [];
  }
}
