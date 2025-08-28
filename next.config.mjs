/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Expose these server environment variables to the client at runtime
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_BEARER_TOKEN: process.env.BEARER_TOKEN,
    NEXT_PUBLIC_HOSTNAME: process.env.APP_ENV, // Use APP_ENV instead of HOSTNAME
  },
};

export default nextConfig;
