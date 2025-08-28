// Simple config with environment variables
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || '';

const config = {
  // Access environment variables like this:
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  appEnv: appEnv,
  isPublicVersion: appEnv === 'maps4fs',
  bearerToken: process.env.NEXT_PUBLIC_BEARER_TOKEN || null,
};

export default config;