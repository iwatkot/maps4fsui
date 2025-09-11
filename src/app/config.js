// Simple config with environment variables
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || '';
const mfsRootDir = process.env.NEXT_PUBLIC_MFS_ROOT_DIR || '/usr/src/app/mfsrootdir';
const mfsTemplatesDir = process.env.NEXT_PUBLIC_MFS_TEMPLATES_DIR || '/usr/src/app/templates';

const config = {
  // Access environment variables like this:
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  appEnv: appEnv,
  isPublicVersion: appEnv === 'maps4fs',
  bearerToken: process.env.NEXT_PUBLIC_BEARER_TOKEN || null,
  mfsRootDir: mfsRootDir,
  mfsMapDir: `${mfsRootDir}/maps`,
  mfsTemplatesDir: mfsTemplatesDir,
};

export default config;