// Simple config with environment variables
const publicHostName = process.env.PUBLIC_HOSTNAME || '';

const config = {
  // Access environment variables like this:
  backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
  publicHostName: publicHostName,
  isPublicVersion: publicHostName === 'maps4fs',
};

export default config;