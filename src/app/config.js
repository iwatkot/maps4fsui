// Simple config with environment variables
const publicHostName = process.env.NEXT_PUBLIC_HOSTNAME || '';

const config = {
  // Access environment variables like this:
  backendUrl: process.env.NEXT_BACKEND_URL || 'maps4fs',
  publicHostName: publicHostName,
  isPublicVersion: publicHostName === 'maps4fs',
};

export default config;