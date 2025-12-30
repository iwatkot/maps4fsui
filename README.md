<div align="center" markdown>

[![Maps4FS](https://img.shields.io/badge/maps4fs-gray?style=for-the-badge)](https://github.com/iwatkot/maps4fs)
[![Maps4FS](https://img.shields.io/badge/atlasfs-green?style=for-the-badge)](https://github.com/iwatkot/atlasfs)
[![Maps4FS](https://img.shields.io/badge/maps4fs-windows-purple?style=for-the-badge)](https://github.com/iwatkot/maps4fswindows)
[![PYDTMDL](https://img.shields.io/badge/pydtmdl-blue?style=for-the-badge)](https://github.com/iwatkot/pydtmdl)
[![PYGDMDL](https://img.shields.io/badge/pygmdl-teal?style=for-the-badge)](https://github.com/iwatkot/pygmdl)  
[![Maps4FS API](https://img.shields.io/badge/maps4fs-api-green?style=for-the-badge)](https://github.com/iwatkot/maps4fsapi)
[![Maps4FS UI](https://img.shields.io/badge/maps4fs-ui-blue?style=for-the-badge)](https://github.com/iwatkot/maps4fsui)
[![Maps4FS Data](https://img.shields.io/badge/maps4fs-data-orange?style=for-the-badge)](https://github.com/iwatkot/maps4fsdata)
[![Maps4FS ChromaDocs](https://img.shields.io/badge/maps4fs-chromadocs-orange?style=for-the-badge)](https://github.com/iwatkot/maps4fschromadocs)  
[![Maps4FS Upgrader](https://img.shields.io/badge/maps4fs-upgrader-yellow?style=for-the-badge)](https://github.com/iwatkot/maps4fsupgrader)
[![Maps4FS Stats](https://img.shields.io/badge/maps4fs-stats-red?style=for-the-badge)](https://github.com/iwatkot/maps4fsstats)
[![Maps4FS Bot](https://img.shields.io/badge/maps4fs-bot-teal?style=for-the-badge)](https://github.com/iwatkot/maps4fsbot)

</div>

<div align="center" markdown>

<img src="https://github.com/iwatkot/maps4fsui/releases/download/2.9.53.5/ui-1280-640.png">

<p align="center">
    <a href="#maps4fs">Maps4FS</a> •
    <a href="#overview">Overview</a>
</p>

[![Join Discord](https://img.shields.io/badge/join-discord-blue)](https://discord.gg/wemVfUUFRA)
[![Docker Pulls](https://img.shields.io/docker/pulls/iwatkot/maps4fsui)](https://hub.docker.com/r/iwatkot/maps4fsui)
[![Docker Image Size](https://img.shields.io/docker/image-size/iwatkot/maps4fsui)](https://hub.docker.com/r/iwatkot/maps4fsui)
[![Docker Version](https://img.shields.io/docker/v/iwatkot/maps4fsui)](https://hub.docker.com/r/iwatkot/maps4fsui)
<br>
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/iwatkot/maps4fsui)](https://github.com/iwatkot/maps4fsui/releases)
[![GitHub issues](https://img.shields.io/github/issues/iwatkot/maps4fsui)](https://github.com/iwatkot/maps4fsui/issues)
[![GitHub Repo stars](https://img.shields.io/github/stars/iwatkot/maps4fsui)](https://github.com/iwatkot/maps4fsui/stargazers)

</div>

# Maps4FS UI

A modern web interface for generating custom Farming Simulator maps using real-world data. This Next.js application provides an intuitive way to create maps for Farming Simulator 22 and 25 games with customizable terrain, textures, and geographic features.

## Features

### 🗺️ Map Generation
- **Real-world terrain**: Generate maps based on actual geographic locations using coordinates
- **Multiple map sizes**: Support for 2048x2048 to 16384x16384 meter maps with custom sizing
- **Multiple games**: Compatible with Farming Simulator 22 and 25
- **Rotation support**: Rotate maps to align with desired orientations

### 🌍 Data Sources
- **Public DTM providers**: Global elevation data from SRTM and other sources
- **Custom OSM files**: Upload your own OpenStreetMap data for specialized areas
- **Multiple resolution options**: Choose from various elevation data resolutions

### 🎨 Customization Options
- **Terrain modification**: Adjust water depth, add foundations, create plateaus
- **Background generation**: Generate custom backgrounds with water features
- **Texture schemas**: Create and edit custom texture mappings
- **Tree schemas**: Define custom vegetation patterns

### 📊 Map Management
- **My Maps**: Browse and manage your generated maps
- **Preview gallery**: View map previews including terrain, satellite imagery, and textures
- **Map duplication**: Clone existing maps with modified settings
- **Download management**: Export completed maps for use in Farming Simulator

### ⚙️ Advanced Settings
- **DEM configuration**: Fine-tune elevation model processing
- **Texture settings**: Customize material and texture generation
- **I3D settings**: Configure 3D model export parameters
- **Satellite imagery**: Integrate aerial photography data

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **3D Visualization**: Three.js with React Three Fiber
- **Maps**: Leaflet with React Leaflet
- **Data Processing**: OSM to GeoJSON conversion
- **File Handling**: Archive creation and management

## Getting Started

### Prerequisites
- Node.js 18+ 
- A running Maps4FS backend service

### Installation

1. Clone the repository:
```bash
git clone https://github.com/iwatkot/maps4fsuib.git
cd maps4fsuib
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your backend URL and other settings
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: URL of the Maps4FS backend service
- `NEXT_PUBLIC_APP_ENV`: Application environment (maps4fs for public version)
- `NEXT_PUBLIC_BEARER_TOKEN`: Authentication token for backend requests
- `NEXT_PUBLIC_MFS_ROOT_DIR`: Root directory for map storage

## Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

### Building Docker Image
```bash
docker build -t maps4fsui .
docker run -p 3000:3000 maps4fsui
```

## Project Structure

- `/src/app` - Next.js app router pages and layouts
- `/src/components` - Reusable React components
- `/src/hooks` - Custom React hooks for API integration
- `/src/utils` - Utility functions and helpers
- `/src/config` - Configuration files and validation schemas
- `/public` - Static assets and files

## Contributing

This repository is part of the larger Maps4FS ecosystem. For contribution guidelines and project information, please refer to the [main Maps4FS repository](https://github.com/iwatkot/maps4fs).

## Related Projects

- [maps4fs](https://github.com/iwatkot/maps4fs) - Core Python library
- [maps4fsapi](https://github.com/iwatkot/maps4fsapi) - Backend API service
- [maps4fsdata](https://github.com/iwatkot/maps4fsdata) - Data processing tools
- [maps4fsstats](https://github.com/iwatkot/maps4fsstats) - Usage statistics
- [maps4fsbot](https://github.com/iwatkot/maps4fsbot) - Discord bot integration
