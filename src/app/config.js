// Simple config with environment variables
const publicHostName = process.env.NEXT_PUBLIC_HOSTNAME || '';

const config = {
  // Access environment variables like this:
  backendUrl: process.env.NEXT_BACKEND_URL || 'http://localhost:8000',
  publicHostName: publicHostName,
  isPublicVersion: publicHostName === 'maps4fs',
  bearerToken: process.env.NEXT_BEARER_TOKEN || null,
};

export default config;